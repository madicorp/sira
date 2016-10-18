from wagtail.wagtailadmin.edit_handlers import FieldPanel
from wagtail.wagtailcore.models import Page


class HomePage(Page):
    content_panels = [
        FieldPanel('title', classname="full title"),
    ]
    promote_panels = Page.promote_panels

    class Meta:
        verbose_name = "Accueil"


class DocumentPage(Page):
    content_panels = [
        FieldPanel('title', classname="full title"),
    ]
    promote_panels = Page.promote_panels

    class Meta:
        verbose_name = "Documents"
