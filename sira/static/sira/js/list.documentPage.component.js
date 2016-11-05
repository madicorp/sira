(function () {
    var thumbnailComponent = _package("com.botilab.components.list").pdfThumbnailComponent;
    _package("com.botilab.components.list").genericListComponentInit("documents", "/api/v2/documents",
                                                                     "document", "items", thumbnailComponent);
})();