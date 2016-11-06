(function () {
    var tagItem = _package("com.botilab.components.list").TagItem;
    _package("com.botilab.components.list").ListElementsComponent = {
        controller: elementsController,
        view: elementsView
    };

    function elementsController(componentArgs) {
        this.vm = {
            items: componentArgs.items
        };
        this.thumbnailComponent = componentArgs.thumbnailComponent;
        this.itemsPerLine = componentArgs.itemsPerLine || 3;
        this.getTagState = componentArgs.getTagState;
        this.setTagState = componentArgs.setTagState;
    }

    function elementsView(ctrl) {
        var items = ctrl.vm.items();
        if (!items) {
            return [];
        }
        var listItems = items.map(listItem);
        return m(".blog-masonry-container", listItems);

        function getItemTags(itemData) {
            return itemData.meta.tags.map(function (tagName) {
                return tagItem(tagName, "#", ctrl.getTagState(tagName), ctrl.setTagState);
            });
        }

        function listItem(itemData) {
            var gridColumnsNb = 12 / ctrl.itemsPerLine;
            return m(".col-md-" + gridColumnsNb + ".col-sm-" + gridColumnsNb + ".blog-masonry-item.branding", [
                m(".item-inner", [
                    m(ctrl.thumbnailComponent, {itemData: itemData}),
                    m(".post-title", [
                        m("h4", itemData.title),
                        m(".sidebar-widget", [
                            m("ul.tags", [
                                getItemTags(itemData)
                            ])

                        ])
                    ])
                ])
            ]);
        }
    }
})();
