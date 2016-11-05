(function () {
    var thumbnailComponent = _package("com.botilab.components.list").imageThumbnailComponent;
    var renderParams = {
        'render-width': 250,
        'render-height': 170,
    };
    _package("com.botilab.components.list").genericListComponentInit("images", "/api/v2/images", "image", "items",
                                                                     thumbnailComponent, 3, 9, renderParams);
})();