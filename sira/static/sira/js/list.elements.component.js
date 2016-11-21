(function () {
    var tagItem = _package("com.botilab.components.list").TagItem;
    var elementsController = _package("com.botilab.components.list").ElementsController;
    _package("com.botilab.components.list").ListElementsComponent = {
        controller: elementsController,
        view: elementsView
    };

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
                    m(ctrl.thumbnailComponent(itemData), {itemData: itemData}),
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
