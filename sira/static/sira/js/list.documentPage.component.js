(function () {
    var thumbnailComponentProvider = _package("com.botilab.components.list").documentThumbnailComponentProvider;
    _package("com.botilab.components.list").genericListComponentInit("documents", "/api/v2/documents",
                                                                     "document", "items", thumbnailComponentProvider);
})();