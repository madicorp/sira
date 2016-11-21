(function () {
    _package("com.botilab.components.list").videoThumbnailComponent = {
        controller: videoThumbnailController,
        view: videoThumbnailView
    };

    function videoThumbnailController(componentArgs) {
        var vm = {
            videoUrl: m.prop(),
            thumbnailUrl: m.prop()
        };
        this.vm = vm;
        vm.videoUrl(componentArgs.itemData.meta.download_url);
        vm.thumbnailUrl(componentArgs.itemData.meta.thumbnail);
    }

    function videoThumbnailView(ctrl) {
        var vm = ctrl.vm;
            return m("img.thumb-video__image[alt='Video preview'][src='"+ vm.thumbnailUrl()+"']");
    }
})();