(function () {
    _package("com.botilab.components.list").documentGenericThumbnailComponent = {
        controller: documentGenericThumbnailController,
        view: documentGenericThumbnailView
    };

    function documentGenericThumbnailController(componentArgs) {
        var vm = {
            documentUrl: m.prop()
        };
        this.vm = vm;
        var pdfUrl = componentArgs.itemData.meta.download_url;
        vm.documentUrl(pdfUrl);
    }

    function documentGenericThumbnailView(ctrl) {
        var vm = ctrl.vm;
        return m("a[href='" + vm.documentUrl() + "']", [
            m(".thumbnail", [
                m("i.fa.fa-5x.fa-file-text-o")
            ])
        ]);
    }
})();