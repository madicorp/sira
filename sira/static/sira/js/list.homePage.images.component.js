(function () {
    var homepageGenericListComponentInit = _package("com.botilab.components.list").homepageGenericListComponentInit;
    var listElementsComponent = _package("com.botilab.components.list").ListImagesComponent;
    var renderParams = {
        'render-width': 380,
        'render-height': 300
    };
    homepageGenericListComponentInit("block-images", "/api/v2/images", imageThumbnailComponentProvider, renderParams,listElementsComponent);

    function imageThumbnailComponentProvider() {
        return _package("com.botilab.components.list").imageThumbnailComponent;
    }
})();