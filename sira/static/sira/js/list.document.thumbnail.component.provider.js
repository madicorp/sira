(function () {
    var pdfThumbnailComponent = _package("com.botilab.components.list").pdfThumbnailComponent;
    var documentGenericThumbnailComponent = _package("com.botilab.components.list").documentGenericThumbnailComponent;
    _package("com.botilab.components.list").documentThumbnailComponentProvider = documentThumbnailComponentProvider;

    function documentThumbnailComponentProvider(itemData) {
        if ("pdf" === itemData.meta.extension) {
            return pdfThumbnailComponent;
        }
        return documentGenericThumbnailComponent;
    }
})();