from __future__ import absolute_import, unicode_literals

from django.conf import settings
from django.conf.urls import include, url
from django.conf.urls.static import static
from django.contrib import admin
from wagtail.contrib.wagtailapi.router import WagtailAPIRouter
from wagtail.wagtailadmin import urls as wagtailadmin_urls
from wagtail.wagtailcore import urls as wagtail_urls
from wagtail.wagtaildocs import urls as wagtaildocs_urls
from wagtail.wagtailimages.views.serve import serve

from sira import views
from sira.views import DocumentsExtraFieldsAPIEndpoint, ImagesExtraFieldsAPIEndpoint

v2 = WagtailAPIRouter('wagtailapi')
v2.register_endpoint('images', ImagesExtraFieldsAPIEndpoint)
v2.register_endpoint('documents', DocumentsExtraFieldsAPIEndpoint)

wagtail_api_urlpatterns = [
    url(r'^v1/tags', views.tags_endpoint),
    url(r'^v1/videos', views.videos_endpoint),
    url(r'^v2/', v2.urls),
]

urlpatterns = [
    url(r'^documents/', include(wagtaildocs_urls)),
    url(r'^api/', include(wagtail_api_urlpatterns)),
    url(r'', include('puput.urls')),
    url(r'^django-admin/', include(admin.site.urls)),
    url(r'^admin/', include(wagtailadmin_urls)),
    url(r'^(?!api)', include(wagtail_urls)),
    url(r'^([^/]*)/(\d*)/([^/]*)/[^/]*$', serve, name='wagtailimages_serve'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
