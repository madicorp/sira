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
        return m(".row.text-center",
                 m("col-md-12", "Tags",
                   m(".row", [
                       ctrl.vm.tags().map(function (tag) {
                           return tagItem(tag, 4);
                       })
                   ]))
        );
    }

    function tagItem(tag, size) {
        return m(".col-md-" + size, [m('span.badge', tag)]);
    }
})();