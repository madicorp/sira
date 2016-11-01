(function () {
    var thumbnailComponent = _package("com.botilab.components.list").pdfThumbnailComponent;
    _package("com.botilab.components.list").genericListComponentInit("documents", "/api/v1/documents",
                                                                     "document", "documents", thumbnailComponent);
})();