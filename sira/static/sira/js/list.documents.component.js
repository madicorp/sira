(function () {
    var tagItem = _package("com.botilab.components.list").TagItem;
    _package("com.botilab.components.list").ListDocumentComponent = {
        controller: documentsController,
        view: documentsView
    };

    function documentsController(componentArgs) {
        this.vm = {
            items: componentArgs.items
        };
        this.thumbnailComponent = componentArgs.thumbnailComponent;
        this.getTagState = componentArgs.getTagState
    }

    function documentsView(ctrl) {
        var items = ctrl.vm.items();
        if (!items) {
            return [];
        }
        var listItems = items.map(listItem);
        return m(".blog-masonry-container", listItems);

        function listItem(itemData) {
            return m(".col-md-4.col-sm-4.blog-masonry-item.branding", [
                m(".item-inner", [
                    m(ctrl.thumbnailComponent, {pdfUrl: itemData.meta.download_url}),
                    m(".post-title", [
                        m("h4", itemData.title),
                        m(".sidebar-widget", [
                            m("ul.tags", [
                                itemData.tags.map(function (tagName) {
                                    var tagActive = ctrl.getTagState(tagName);
                                    return tagItem(tagName, "#", tagActive);
                                })
                            ])

                        ])
                    ])
                ])
            ]);
        }
    }


})();
