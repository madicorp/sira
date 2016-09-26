from django.shortcuts import render
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from rest_framework.decorators import api_view
from rest_framework.response import Response
from taggit.models import Tag

from wagtail.wagtailcore.models import Page
from wagtail.wagtailsearch.models import Query

try:
    # Wagtail >= 1.1
    from wagtail.contrib.wagtailsearchpromotions.models import SearchPromotion
except ImportError:
    # Wagtail < 1.1
    from wagtail.wagtailsearch.models import EditorsPick as SearchPromotion


def search(request):
    # Search
    search_query = request.GET.get('query', None)
    if search_query:
        search_results = Page.objects.live().search(search_query)
        query = Query.get(search_query)

        # Record hit
        query.add_hit()

        # Get search picks
        search_picks = query.editors_picks.all()
    else:
        search_results = Page.objects.none()
        search_picks = SearchPromotion.objects.none()

    # Pagination
    page = request.GET.get('page', 1)
    paginator = Paginator(search_results, 10)
    try:
        search_results = paginator.page(page)
    except PageNotAnInteger:
        search_results = paginator.page(1)
    except EmptyPage:
        search_results = paginator.page(paginator.num_pages)

    return render(request, 'sira/search_results.html', {
        'search_query': search_query,
        'search_results': search_results,
        'search_picks': search_picks,
    })


@api_view(['GET'])
def tags_endpoint(request):
    if 'GET' == request.method:
        data = request.data
        query = 'SELECT DISTINCT tag.* FROM taggit_tag AS tag ' \
                'INNER JOIN taggit_taggeditem AS tti ON tag.id = tti.tag_id '
        if 'type' in data:
            query += 'INNER JOIN django_content_type AS ct on tti.content_type_id = ct.id AND ct.model=%s'
            query_set = Tag.objects.raw(query, params=(data['type']))
        else:
            query_set = Tag.objects.raw(query)
        return Response([tag.name for tag in query_set])
