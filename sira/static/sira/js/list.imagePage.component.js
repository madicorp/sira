(function () {
    var thumbnailComponent = _package("com.botilab.components.list").imageThumbnailComponent;
    var listElementsComponent = _package("com.botilab.components.list").ListImagesComponent;
    var renderParams = {
         'render-width': 380,
        'render-height': 300
    };
    _package("com.botilab.components.list").genericListComponentInit("images", "/api/v2/images", "image", "items",
                                                                     thumbnailComponent, 3, 9, renderParams,
                                                                     listElementsComponent,6);
})();