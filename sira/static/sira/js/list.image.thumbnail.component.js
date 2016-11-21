(function () {
    _package('com.botilab.components.list').imageThumbnailComponent = {
        controller: imageThumbnailController,
        view: imageThumbnailView
    };

    function imageThumbnailController(componentArgs) {
        var vm = {
            imgId: m.prop(),
            imgUrl: m.prop(),
            thumbnailUrl: m.prop()
        };
        this.vm = vm;
        vm.imgId(componentArgs.itemData.id);
        vm.imgUrl(componentArgs.itemData.meta.download_url);
        vm.thumbnailUrl(componentArgs.itemData.meta.thumbnail_url);
    }

    function imageThumbnailView(ctrl) {
        var vm = ctrl.vm;
        return  m(imgSelector(vm.thumbnailUrl()));

        function imgSelector(url) {
            return 'img.background-image[src=' + url + ']';
        }
    }



})();