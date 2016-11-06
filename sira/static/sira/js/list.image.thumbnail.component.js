(function () {
    _package('com.botilab.components.list').imageThumbnailComponent = {
        controller: imageThumbnailController,
        view: imageThumbnailView
    };

    function imageThumbnailController(componentArgs) {
        var vm = {
            imgId: m.prop(),
            imgUrl: m.prop(),
            thumbnailUrl: m.prop(),
        };
        this.vm = vm;
        vm.imgId(componentArgs.itemData.id);
        vm.imgUrl(componentArgs.itemData.meta.download_url);
        vm.thumbnailUrl(componentArgs.itemData.meta.thumbnail_url);
    }

    function imageThumbnailView(ctrl) {
        var vm = ctrl.vm;
        var imgModalId = 'img-' + vm.imgId();
        var imgModalIdSelector = '#' + imgModalId;
        var thumbnailParams = {
            href: imgModalIdSelector,
            rel: 'modal:open',
        };
        return m('a', thumbnailParams, [
            m(".thumbnail", [
                m(imgSelector(vm.thumbnailUrl())),
            ]),
            originalImgModal()
        ]);

        function imgSelector(url) {
            return 'img[src=' + url + ']';
        }

        function originalImgModal() {
            return m('.modal.sira', {
                id: imgModalId,
            }, [
                         m(imgSelector(vm.imgUrl()))
                     ]);
        }

    }
})();