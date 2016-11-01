(function () {
    var tagTogglesEvent = document.createEvent('CustomEvent');
    var getQueryParam = _package("com.botilab.components").getQueryParam;
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
            tagActiveStates: m.prop({})
        };
        this.vm = vm;
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
        var activeTags = getQueryParam("tags") ? getQueryParam("tags").split("+") : [];
        activeTags.forEach(function (activeTag) {
            vm.tagActiveStates()[activeTag] = true;
        });

        document.addEventListener('tagTogglesEvent', function (tagToggleEvent) {
            vm.tagActiveStates()[tagToggleEvent.detail.tagName] = tagToggleEvent.detail.active;
        });
        return m(".blog-sidebar",
                 m(".sidebar-widget",
                   m("h2", "Étiquettes"),
                   getTagsItem(vm))
        );
    }

    var getTagsItem = function (vm) {
        if (!vm.tags() || vm.tags().length === 0) {
            return m("h6", "Pas d'étiquettes disponibles");
        }
        return m("ul.tags", [
            vm.tags().map(function (tagName) {
                return tagItem(tagName, '#', vm.tagActiveStates()[tagName]);
            })
        ]);
    };

    function tagItem(tagName, link, active) {
        var tagActiveClass = !!active ? "active" : "inactive";
        return m("li",
                 [m('a.' + tagActiveClass + '[href="' + link + '"]', {onclick: noScrollAnchorCurry(toggleTag)},
                    tagName)]);

        function toggleTag() {
            tagTogglesEvent.initCustomEvent("tagTogglesEvent", false, false, {tagName: tagName, active: !active});
            document.dispatchEvent(tagTogglesEvent);
        }
    }
})();