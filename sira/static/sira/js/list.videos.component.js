(function () {
    var tagItem = _package("com.botilab.components.list").TagItem;
    var elementsController = _package("com.botilab.components.list").ElementsController;
    _package("com.botilab.components.list").ListVideosComponent = {
        controller: elementsController,
        view: elementsView
    };

    function elementsView(ctrl) {
        var items = ctrl.vm.items();
        if (!items) {
            return [];
        }
        var listItems = items.map(listItem);
        return m(".row", {config: magnificPopupConfig}, [listItems]);

        function getItemTags(itemData) {
            return itemData.meta.tags.map(function (tagName) {
                return tagItem(tagName, "#", ctrl.getTagState(tagName), ctrl.setTagState);
            });
        }

        function listItem(itemData) {
            var id = "#" + itemData.title.toLowerCase().replace(/\s/g, '') + itemData.id;
            var jsNotEnabledMsg =
                "To view this video please enable JavaScript, and consider upgrading to a web browser" +
                "that <a href='http://videojs.com/html5-video-support/' target='_blank'>supports HTML5 video</a>";
            return m(".col-md-6.col-sm-6.col-xs-24",
                     m("article.thumb-video.mb40",
                       [
                           m("a.thumb-video__link.js-modal-video[href='" + id + "']",
                             [
                                 m(ctrl.thumbnailComponent(), {itemData: itemData}),
                                 m("span.thumb-video__button",
                                   m("svg[height='29px'][version='1.1'][viewBox='0 0 415.346 415.346'][width='21px'][x='0px'][xml:space='preserve'][xmlns='http://www.w3.org/2000/svg'][xmlns:xlink='http://www.w3.org/1999/xlink'][y='0px']",
                                     {style: {"enable-background": "new 0 0 415.346 415.346"}},
                                     m("g",
                                       m("path[d='M41.712,415.346c-11.763,0-21.3-9.537-21.3-21.3V21.299C20.412,9.536,29.949,0,41.712,0l346.122,191.697 c0,0,15.975,15.975,0,31.951C371.859,239.622,41.712,415.346,41.712,415.346z'][fill='#FFFFFF']")
                                     )
                                   )
                                 ),
                                 m("span.thumb-video__time",
                                   itemData.meta.duration
                                 )
                             ]
                           ),
                           m(".thumb-video__footer", [
                               m("h4.thumb-video__title.post-title",
                                 itemData.title
                               ),
                               m(".sidebar-widget", [
                                   m("ul.tags", [
                                       getItemTags(itemData)
                                   ])
                               ])
                           ])
                       ]
                     ),
                     m(id + ".container.hite-popup.mfp-hide.embed-responsive.embed-responsive-16by9",
                       m(
                           "video.embed-responsive-item.video-js.vjs-default-skin[controls='true'][preload='auto]",
                           [
                               m("source[src='" + itemData.meta.download_url + "']"),
                               m("p.vjs-no-js", m.trust(jsNotEnabledMsg))
                           ])
                     )
            )
                ;
        }


        function magnificPopupConfig(element, init, context) {
            if (!init) {
                $("a.thumb-video__link").magnificPopup({
                                                           type: 'inline',
                                                           midClick: true,
                                                           closeBtnInside: true,
                                                           removalDelay: 500,
                                                           gallery: {enabled: true},
                                                           preloader: true
                                                       });
            }
        }
    }
})();
