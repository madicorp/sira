from wagtail.wagtailadmin.edit_handlers import FieldPanel
from wagtail.wagtailcore.models import Page


class HomePage(Page):
    class Meta:
        verbose_name = "Homepage"


HomePage.content_panels = [
    FieldPanel('title', classname="full title"),
]

HomePage.promote_panels = Page.promote_panels
