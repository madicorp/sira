from django.test import TestCase
from taggit.models import Tag, TaggedItem

from sira.views import get_tags


class TagsEndpointTestCase(TestCase):
    def setUp(self):
        foo_tag = Tag.objects.create(name="Foo", slug="foo")
        Tag.objects.create(name="Bar", slug="bar")
        TaggedItem.objects.create(tag=foo_tag, object_id=12, content_type_id=1)
        TaggedItem.objects.create(tag=foo_tag, object_id=13, content_type_id=2)
        foo_bar_tag = Tag.objects.create(name="FooBar", slug="foo_bar")
        TaggedItem.objects.create(tag=foo_bar_tag, object_id=15, content_type_id=4)

    def test_get_tags_should_return_foo_foobar_tags(self):
        # GIVEN
        content_type = None

        # WHEN
        tags = get_tags(content_type)

        # THEN
        self.assertEqual(tags, ["Foo", "FooBar"])

    def test_get_tags_should_only_return_foobar_tag_for_type_3(self):
        # GIVEN
        content_type = "document"

        # WHEN
        tags = get_tags(content_type)

        # THEN
        self.assertEqual(tags, ["FooBar"])
