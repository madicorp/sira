from django.db.models.signals import pre_save
from django.dispatch import receiver
from wagtail.wagtailadmin.edit_handlers import FieldPanel
from wagtail.wagtailcore.models import Page
from wagtail.wagtailsearch import index
from wagtailmedia.models import Media


class HomePage(Page):
    content_panels = [
        FieldPanel("title", classname="full title"),
    ]
    promote_panels = Page.promote_panels
    subpage_types = ["puput.BlogPage", "sira.DocumentPage", "sira.VideoPage", "sira.ImagePage"]

    class Meta:
        verbose_name = "Accueil"


class DocumentPage(Page):
    content_panels = [
        FieldPanel("title", classname="full title"),
    ]
    promote_panels = Page.promote_panels
    subpage_types = []

    class Meta:
        verbose_name = "Documents"


class VideoPage(Page):
    content_panels = [
        FieldPanel("title", classname="full title"),
    ]
    promote_panels = Page.promote_panels
    subpage_types = []

    class Meta:
        verbose_name = "Videos"


class ImagePage(Page):
    content_panels = [
        FieldPanel("title", classname="full title"),
    ]
    promote_panels = Page.promote_panels
    subpage_types = []

    class Meta:
        verbose_name = "Images"


Media.search_fields += [index.FilterField("type")]
Media.admin_form_fields = [
    "title",
    "file",
    "collection",
    "tags",
]


@receiver(signal=pre_save, sender=Media, dispatch_uid="set_default_duration_id")
def set_default_duration_id(sender, **kwargs):
    kwargs.get("instance").duration = 0
