from django.test import TestCase
from wagtailmedia.models import Media

from sira.views import get_videos


class VideosEndpointTestCase(TestCase):
    def setUp(self):
        Media.objects.create(title="Title 1", file="media/title_1", type="video", duration=5)
        Media.objects.create(title="Title 2", file="media/title_2", type="video", duration=5)
        Media.objects.create(title="Title 3", file="media/title_3", type="audio", duration=5)

    def test_should_return_only_ordered_videos(self):
        # GIVEN

        # WHEN
        videos = get_videos()

        # THEN
        self.assertEqual([video.title for video in videos.all()], ["Title 2", "Title 1"])

    def test_should_return_only_title_1_video(self):
        # GIVEN
        query_string = "1"

        # WHEN
        title_1_video = get_videos(query_string=query_string)

        # THEN
        self.assertEqual([video.title for video in title_1_video], ["Title 1"])

# Cannot test tagged videos search because no elasticsearch but working in the admin so should work
