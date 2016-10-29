from bs4 import BeautifulSoup
from django import template
from puput.models import BlogPage
from wagtail.wagtailcore.models import Page

register = template.Library()


@register.assignment_tag(takes_context=True)
def get_site_root(context):
    # NB this returns a core.Page, not the implementation-specific model used
    # so object-comparison to self will return false as objects would differ
    return context['request'].site.root_page


def has_menu_children(page):
    return page.get_children().live().in_menu().exists()


# Retrieves the top menu items - the immediate children of the parent page
# The has_menu_children method is necessary because the bootstrap menu requires
# a dropdown class to be applied to a parent
@register.inclusion_tag('sira/tags/top_menu.html', takes_context=True)
def top_menu(context, parent, calling_page=None):
    menuitems = parent.get_children().live().in_menu()
    for menuitem in menuitems:
        menuitem.show_dropdown = has_menu_children(menuitem)
        # We don't directly check if calling_page is None since the template
        # engine can pass an empty string to calling_page
        # if the variable passed as calling_page does not exist.
        menuitem.active = (calling_page.url.startswith(menuitem.url)
                           if calling_page else False)
    return {
        'calling_page': calling_page,
        'menuitems': menuitems,
        # required by the pageurl tag that we want to use within this template
        'request': context['request'],
    }


# Retrieves the children of the top menu items for the drop downs
@register.inclusion_tag('sira/tags/top_menu_children.html', takes_context=True)
def top_menu_children(context, parent):
    menuitems_children = parent.get_children()
    menuitems_children = menuitems_children.live().in_menu()
    return {
        'parent': parent,
        'menuitems_children': menuitems_children,
        # required by the pageurl tag that we want to use within this template
        'request': context['request'],
    }


@register.inclusion_tag('sira/tags/breadcrumbs.html', takes_context=True)
def breadcrumbs(context):
    self = context.get('self')
    if self is None or self.depth <= 2:
        # When on the home page, displaying breadcrumbs is irrelevant.
        ancestors = ()
    else:
        ancestors = Page.objects.ancestor_of(
            self, inclusive=True).filter(depth__gt=2)
    return {
        'ancestors': ancestors,
        'request': context['request'],
    }


@register.inclusion_tag('sira/tags/news_block_homepage.html', takes_context=True)
def news_block_homepage(context):
    self = context.get('self')
    return {
        'request': context['request']
    }


@register.inclusion_tag('sira/tags/images_gallery_block_homepage.html', takes_context=True)
def images_gallery_block_homepage(context):
    self = context.get('self')
    return {
        'request': context['request']
    }


@register.inclusion_tag('sira/tags/documents_block_homepage.html', takes_context=True)
def documents_block_homepage(context):
    self = context.get('self')
    return {
        'request': context['request']
    }


@register.simple_tag()
def get_news_page():
    return BlogPage.objects.first()


@register.simple_tag()
def get_last_news_entries():
    news_page = get_news_page()
    news_entries = news_page.get_entries()
    last_news_entries = news_entries[:news_page.num_last_entries]
    for index, news_entry in enumerate(last_news_entries):
        news_entry.body = get_entry_sample(news_entry.body, False)
    return last_news_entries


@register.simple_tag()
def get_entry_sample(entry_body, ellipsis=True):
    entry_sample = BeautifulSoup(entry_body).text[:150]
    if not ellipsis:
        return entry_sample
    return entry_sample + '...'
