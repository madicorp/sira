(function () {
    _package("com.botilab.components.list").videoThumbnailComponent = {
        controller: videoThumbnailController,
        view: videoThumbnailView
    };

    function videoThumbnailController(componentArgs) {
        var vm = {
            videoUrl: m.prop()
        };
        this.vm = vm;
        vm.videoUrl(componentArgs.itemData.meta.download_url);
    }

    function videoThumbnailView(ctrl) {
        var vm = ctrl.vm;
        var jsNotEnabledMsg =
            "To view this video please enable JavaScript, and consider upgrading to a web browser" +
            "that <a href='http://videojs.com/html5-video-support/' target='_blank'>supports HTML5 video</a>";
        return m(
            "video.video-js.vjs-default-skin[preload=auto][data-setup=\"{\"controls\":true}\"]",
            [
                m("source[src='" + vm.videoUrl() + "']"),
                m("p.vjs-no-js", m.trust(jsNotEnabledMsg)),
            ]);
    }
})();