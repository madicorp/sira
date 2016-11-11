(function () {
    var tagTogglesEvent = document.createEvent('CustomEvent');
    var noScrollAnchorCurry = _package("com.botilab.components").noScrollAnchorCurry;

    _package("com.botilab.components.list").tagTogglesEvent = tagTogglesEvent;
    _package("com.botilab.components.list").TagItem = tagItem;

    _package("com.botilab.components.list").ListTagComponent = {
        controller: tagsController,
        view: tagsView
    };

    function tagsController(componentArgs) {
        var listItemType = componentArgs.listItemType;
        var vm = {
            tags: m.prop([]),
            tagActiveStates: componentArgs.tagActiveStates,
        };
        this.vm = vm;
        this.getTagState = componentArgs.getTagState;
        this.setTagState = componentArgs.setTagState;
        m.request({method: "GET", url: "/api/v1/tags?type=" + listItemType})
         .then(function (tagNames) {
             vm.tags(tagNames);
             tagNames.forEach(function (tagName) {
                 vm.tagActiveStates()[tagName] = vm.tagActiveStates()[tagName] || false;
             });
         });
    }

    function tagsView(ctrl) {
        var vm = ctrl.vm;
        return m(".blog-sidebar",
                 m(".sidebar-widget",
                   m("h2", "Étiquettes"),
                   getTagsItem(vm))
        );

        function getTagsItem() {
            if (!vm.tags() || vm.tags().length === 0) {
                return m("h6", "Pas d'étiquettes disponibles");
            }
            return m("ul.tags", [
                vm.tags().map(function (tagName) {
                    return tagItem(tagName, '#', ctrl.getTagState(tagName), ctrl.setTagState);
                })
            ]);
        }
    }

    function tagItem(tagName, link, active, setTagState) {
        var tagActiveClass = !!active ? "active" : "inactive";
        return m("li",
                 [m('a.' + tagActiveClass + '[href="' + link + '"]', {onclick: noScrollAnchorCurry(toggleTag)},
                    tagName)]);

        function toggleTag() {
            setTagState(tagName, !active);
        }
    }
})();