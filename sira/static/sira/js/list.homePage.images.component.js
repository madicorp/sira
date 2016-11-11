(function () {
    var homepageGenericListComponentInit = _package("com.botilab.components.list").homepageGenericListComponentInit;
    var renderParams = {
        'render-width': 250,
        'render-height': 170,
    };
    homepageGenericListComponentInit("block-images", "/api/v2/images", imageThumbnailComponentProvider, renderParams);

    function imageThumbnailComponentProvider() {
        return _package("com.botilab.components.list").imageThumbnailComponent;
    }
})();