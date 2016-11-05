import os

from django.urls import reverse
from django.utils.html import escape
from rest_framework.decorators import api_view
from rest_framework.pagination import LimitOffsetPagination
from rest_framework.response import Response
from taggit.models import Tag
from wagtail.wagtailcore.models import Collection
from wagtail.wagtaildocs.api.v2.endpoints import DocumentsAPIEndpoint
from wagtail.wagtaildocs.api.v2.serializers import DocumentDownloadUrlField, DocumentSerializer
from wagtail.wagtailimages.api.v2.endpoints import ImagesAPIEndpoint
from wagtail.wagtailimages.api.v2.serializers import ImageSerializer
from wagtail.wagtailimages.models import Image
from wagtail.wagtailimages.views.serve import generate_signature
from wagtailmedia.models import Media


class DocumentAbsoluteDownloadUrlField(DocumentDownloadUrlField):
    def to_representation(self, document):
        return document.url


class DocumentsExtraSerializer(DocumentSerializer):
    download_url = DocumentAbsoluteDownloadUrlField(read_only=True)


class DocumentsExtraFieldsAPIEndpoint(DocumentsAPIEndpoint):
    base_serializer_class = DocumentsExtraSerializer
    body_fields = DocumentsAPIEndpoint.body_fields + ['created_at']


def _original_image_url(image):
    signature = generate_signature(image.id, 'original')
    return reverse('wagtailimages_serve', args=[signature, image.id, 'original'])


class ImageOriginalAbsoluteDownloadUrlField(DocumentDownloadUrlField):
    def to_representation(self, image):
        return _original_image_url(image)


class ImageThumbnailAbsoluteDownloadUrlField(DocumentDownloadUrlField):
    render_width_param_name = 'render-width'
    render_height_param_name = 'render-height'

    def to_representation(self, image):
        request = self.context['request']
        request_get = request.GET
        if self.render_width_param_name not in request_get or self.render_height_param_name not in request_get:
            return _original_image_url(image)
        request_render_width = request_get[self.render_width_param_name]
        request_render_height = request_get[self.render_height_param_name]
        image_format = 'fill-{}x{}-c100'.format(request_render_width, request_render_height)
        signature = generate_signature(image.id, image_format)
        return reverse('wagtailimages_serve', args=[signature, image.id, image_format])


class ImagesExtraFieldsSerializer(ImageSerializer):
    download_url = ImageOriginalAbsoluteDownloadUrlField(read_only=True)
    thumbnail_url = ImageThumbnailAbsoluteDownloadUrlField(read_only=True)

    class Meta:
        model = Image
        fields = ['thumbnail_url']


class ImagesExtraFieldsAPIEndpoint(ImagesAPIEndpoint):
    _images_extra_meta_fields = ['download_url', 'thumbnail_url']
    base_serializer_class = ImagesExtraFieldsSerializer
    body_fields = ImagesAPIEndpoint.body_fields + ['created_at']
    meta_fields = ImagesAPIEndpoint.meta_fields + _images_extra_meta_fields
    listing_default_fields = ImagesAPIEndpoint.listing_default_fields + _images_extra_meta_fields
    nested_default_fields = ImagesAPIEndpoint.nested_default_fields + _images_extra_meta_fields
    known_query_parameters = list(ImagesAPIEndpoint.known_query_parameters) + [
        ImageThumbnailAbsoluteDownloadUrlField.render_width_param_name,
        ImageThumbnailAbsoluteDownloadUrlField.render_height_param_name,
    ]


@api_view(['GET'])
def tags_endpoint(request):
    if 'GET' == request.method:
        tagged_type = None
        params = request.query_params
        if 'type' in params:
            tagged_type = params['type']
        return Response(get_tags(tagged_type))


def get_tags(type=None):
    query = 'SELECT DISTINCT tag.* FROM taggit_tag AS tag ' \
            'INNER JOIN taggit_taggeditem AS tti ON tag.id = tti.tag_id '
    if type is not None:
        query += 'INNER JOIN django_content_type AS ct on tti.content_type_id = ct.id AND ct.model=%s'
        query_set = Tag.objects.raw(query, params=(type,))
    else:
        query_set = Tag.objects.raw(query)
    return [tag.name for tag in query_set]


@api_view(['GET'])
def videos_endpoint(request):
    if 'GET' == request.method:
        # Ordering
        ordering = '-created_at'
        if 'ordering' in request.GET and request.GET['ordering'] in ['title', '-created_at']:
            ordering = request.GET['ordering']

        # Filter by collection
        collection_id = request.GET.get('collection_id')

        # Search
        query_string = None
        if 'search' in request.GET:
            query_string = escape(request.GET.get('search'))

        # Pagination
        videos = get_videos(ordering, collection_id, query_string)
        pagination = VideoPagination()
        videos_page = pagination.paginate_queryset(videos, request)
        videos_page_view = [_get_video_view(video) for video in videos_page]
        return pagination.get_paginated_response(videos_page_view)


def get_videos(ordering='-created_at', collection_id=None, query_string=None):
    # Ordering
    media = Media.objects.filter(type='video').order_by(ordering)

    # Filter by collection
    if collection_id:
        try:
            current_collection = Collection.objects.get(id=collection_id)
            media = media.filter(collection=current_collection)
        except (ValueError, Collection.DoesNotExist):
            pass

    # Search
    if query_string:
        # Already protected against SQL injection
        # https://docs.djangoproject.com/fr/1.10/topics/security/#sql-injection-protection
        media = media.search(query_string)

    return media


def get_file_field_ext(file_field):
    return file_field.file.name.split(os.extsep)[-1]


def _get_video_view(video):
    thumbnail = None
    if video.thumbnail:
        thumbnail = '/media/images/' + str(video.thumbnail)
    # This should be refactored if too slow.
    # If that's the case, we can get the tags in bulk for a whole page of videos and then link them in memory
    # on the python side.
    query = \
        'SELECT DISTINCT tag.* FROM taggit_tag AS tag ' \
        'INNER JOIN taggit_taggeditem AS tti ON tag.id = tti.tag_id AND tti.object_id={} ' \
        'INNER JOIN django_content_type AS ct on tti.content_type_id = ct.id AND app_label=\'{}\' AND ct.model=\'{}\'' \
            .format(video.id, 'wagtailmedia', 'media')
    video_tags = [tag.name for tag in Tag.objects.raw(query)]
    return {
        'id': video.id,
        'meta': {
            'thumbnail': thumbnail,
            'download_url': '/media/' + str(video.file),
            'extension': get_file_field_ext(video.file),
            'duration': video.duration,
            'tags': video_tags,
        },
        'title': video.title,
    }


class VideoPagination(LimitOffsetPagination):
    default_limit = 9

    def __init__(self):
        self.request = None
        self.offset = 0
        self.limit = LimitOffsetPagination.default_limit
        self.count = 0

    def get_paginated_response(self, data):
        return Response({
            'meta': {
                'total_count': self.count
            },
            'videos': data
        })
