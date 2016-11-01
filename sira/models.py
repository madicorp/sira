from wagtail.wagtailadmin.edit_handlers import FieldPanel
from wagtail.wagtailcore.models import Page
from wagtail.wagtailsearch import index
from wagtailmedia.models import Media


class HomePage(Page):
    content_panels = [
        FieldPanel('title', classname="full title"),
    ]
    promote_panels = Page.promote_panels
    subpage_types = ['puput.BlogPage', 'sira.DocumentPage', 'sira.VideoPage']

    class Meta:
        verbose_name = "Accueil"


class DocumentPage(Page):
    content_panels = [
        FieldPanel('title', classname="full title"),
    ]
    promote_panels = Page.promote_panels
    subpage_types = []

    class Meta:
        verbose_name = "Documents"


class VideoPage(Page):
    content_panels = [
        FieldPanel('title', classname="full title"),
    ]
    promote_panels = Page.promote_panels
    subpage_types = []

    class Meta:
        verbose_name = "Vidéos"


Media.search_fields += [index.FilterField('type')]
