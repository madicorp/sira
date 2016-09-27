(function () {
    _package("com.botilab.components.list").TagItem = tagItem;

    _package("com.botilab.components.list").ListTagComponent = {
        controller: tagsController,
        view: tagsView
    };

    function tagsController(componentArgs) {
        var listItemType = componentArgs.listItemType;
        var vm = {
            tags: m.prop([])
        };
        this.vm = vm;
        m.request({method: "GET", url: "/api/v1/tags?type=" + listItemType})
         .then(vm.tags);
    }

    function tagsView(ctrl) {
        return m(".blog-sidebar",
                 m(".sidebar-widget",
                   m("h2", "Étiquettes"),
                   m("ul.tags", [
                       ctrl.vm.tags().map(function (tag) {
                           return tagItem(tag, '#');
                       })
                   ]))
        );
    }

    function tagItem(tag, link) {
        return m("li", [m('a[href="' + link + '"]', tag)]);
    }
})();