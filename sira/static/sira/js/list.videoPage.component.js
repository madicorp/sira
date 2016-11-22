(function () {
    var thumbnailComponent = _package("com.botilab.components.list").videoThumbnailComponent;
    var listElementsComponent = _package("com.botilab.components.list").ListVideosComponent;
    _package("com.botilab.components.list").genericListComponentInit("videos", "/api/v1/videos", "media", "videos",
                                                                     thumbnailComponent, 1, 5,null,listElementsComponent);
})();