from __future__ import absolute_import, unicode_literals

import os

from django.conf import settings
from django.conf.urls import include, url
from django.conf.urls.i18n import i18n_patterns
from django.conf.urls.static import static
from django.contrib import admin
from wagtail.contrib.wagtailapi.endpoints import PagesAPIEndpoint, ImagesAPIEndpoint, DocumentsAPIEndpoint
from wagtail.contrib.wagtailapi.router import WagtailAPIRouter
from wagtail.contrib.wagtailapi.serializers import DocumentMetaField, BaseSerializer
from wagtail.contrib.wagtailapi.utils import get_full_url
from wagtail.wagtailadmin import urls as wagtailadmin_urls
from wagtail.wagtailcore import urls as wagtail_urls
from wagtail.wagtaildocs import urls as wagtaildocs_urls

from sira import views


class DocumentExtraFieldsMetaField(DocumentMetaField):
    def to_representation(self, document):
        representation = super(DocumentExtraFieldsMetaField, self).to_representation(document)
        representation['extension'] = DocumentExtraFieldsMetaField.get_document_file_ext(document)
        representation['download_url'] = get_full_url(self.context['request'], document.url)
        return representation

    @staticmethod
    def get_document_file_ext(document):
        return document.file.name.split(os.extsep)[-1]


class DocumentsExtraFieldsSerializer(BaseSerializer):
    meta = DocumentExtraFieldsMetaField()


class DocumentsExtraFieldsAPIEndpoint(DocumentsAPIEndpoint):
    base_serializer_class = DocumentsExtraFieldsSerializer
    extra_api_fields = DocumentsAPIEndpoint.extra_api_fields + ['created_at']


v1 = WagtailAPIRouter('wagtailapi_v1')
v1.register_endpoint('pages', PagesAPIEndpoint)
v1.register_endpoint('images', ImagesAPIEndpoint)
v1.register_endpoint('documents', DocumentsExtraFieldsAPIEndpoint)

wagtail_api_urlpatterns = [
    url(r'^v1/tags', views.tags_endpoint),
    url(r'^v1/', v1.urls),
]

urlpatterns = [
    url(r'^documents/', include(wagtaildocs_urls)),
    url(r'^api/', include(wagtail_api_urlpatterns)),
]

urlpatterns += i18n_patterns(
    url(r'^django-admin/', include(admin.site.urls)),
    url(r'^admin/', include(wagtailadmin_urls)),
    url(r'^search/$', views.search, name='search'),
    url(r'^(?!api)', include(wagtail_urls)),
    prefix_default_language=True
)

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
