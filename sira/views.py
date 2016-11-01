import os

from django.utils.translation import ugettext_lazy as _
from rest_framework.decorators import api_view
from rest_framework.pagination import LimitOffsetPagination
from rest_framework.response import Response
from taggit.models import Tag
from wagtail.wagtailadmin.forms import SearchForm
from wagtail.wagtailcore.models import Collection
from wagtailmedia.models import Media


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
        if 'q' in request.GET:
            form = SearchForm(request.GET, placeholder=_("Search media files"))
            if form.is_valid():
                query_string = form.cleaned_data['q']

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
        },
        'title': video.title,
        'tags': video_tags,
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
