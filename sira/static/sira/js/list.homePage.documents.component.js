(function () {
    var homepageGenericListComponentInit = _package("com.botilab.components.list").homepageGenericListComponentInit;
    var documentThumbnailComponentProvider = _package("com.botilab.components.list").documentThumbnailComponentProvider;
    homepageGenericListComponentInit("block-document", "/api/v2/documents", documentThumbnailComponentProvider);
})();