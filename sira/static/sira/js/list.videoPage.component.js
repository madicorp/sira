(function () {
    var thumbnailComponent = _package("com.botilab.components.list").videoThumbnailComponent;
    _package("com.botilab.components.list").genericListComponentInit("videos", "/api/v1/videos", "media", "videos",
                                                                     thumbnailComponent, 1, 5);
})();