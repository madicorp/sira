(function () {
    var pdfThumbnailComponent = _package("com.botilab.components.list").pdfThumbnailComponent;
    var listTagComponent = _package("com.botilab.components.list").ListTagComponent;
    var tagItem = _package("com.botilab.components.list").TagItem;
    var noScrollAnchorCurry = _package("com.botilab.components").noScrollAnchorCurry;
    var listController = _package("com.botilab.components.list").InnerController;


    _package("com.botilab.components.list").InnerComponent = {
        controller: listController,
        view: listView
    };

    var isTagStateListenerInit = false;

    function listView(ctrl) {
        var paginationComp = pagination();

        if (!isTagStateListenerInit) {
            document.addEventListener('tagTogglesEvent', function toggleTagVMState(tagToggleEvent) {
                ctrl.setTagState(tagToggleEvent.detail.tagName, tagToggleEvent.detail.active);
            });
            isTagStateListenerInit = true;
        }

        return m("", [
            filterComp(),
            paginationComp,
            m(".container", [
                m(".row", [
                    m(".col-md-9", [
                        listItems()
                    ]),
                    m(".col-sm-3", [
                        m(listTagComponent, {listItemType: ctrl.tagArgs})
                    ])
                ])
            ]),
            paginationComp
        ]);


        function filterComp() {
            return [
                m(".container", [
                    m(".row", [
                        m(".col-sm-12.text-center", [
                            m(".sidebar-widget", [
                                m("h5.widget-title"),
                                m("form.comment-form", [
                                    m(".form-input", [
                                        filterItem()
                                    ])
                                ])
                            ])
                        ])
                    ])
                ])
            ];
        }

        function filterItem() {
            var filterInputSelector = "input[type=text][placeholder='Recherche...']";
            var filterValue = ctrl.vm.filterValue();
            if (!ctrl.nullNorUndefined(filterValue)) {
                filterInputSelector += "[value='" + filterValue + "']";
            }
            return m(filterInputSelector, {
                oninput: function (e) {
                    var query = e.target.value.split(" ").join("+");
                    ctrl.filter(query || "");
                }
            });
        }

        function listItems() {
            var items = ctrl.vm.items();
           if (!items) {
                return [];
            }
            var listItems = items.map(listItem);
            return m(".blog-masonry-container", listItems);
        }

        function listItem(itemData) {
            return m(".col-md-4.col-sm-4.blog-masonry-item.branding", [
                m(".item-inner", [
                    m(pdfThumbnailComponent, {pdfUrl: itemData.meta.download_url}),
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

        function pagination() {
            return [
                m(".container",[
                    m(".row",[
                        m(".col-sm-12.text-center",[
                            m("ul.pagination.pagination-md",[
                                paginationItems()
                            ])
                        ])
                    ])
                ])
            ];
        }

        function paginationItems() {
            if (!ctrl.vm.pageCount() || ctrl.vm.pageCount() < 1) {
                return [];
            }
            var paginationIndexItems = getPaginationIndices(ctrl.vm.pageCount()).map(paginationItem);
            paginationIndexItems.splice(0, 0, prevItem());
            paginationIndexItems.push(nextItem());
            return paginationIndexItems;
        }

        function prevItem() {
            var nextItemElt = "li";
            if (!ctrl.hasPrev()) {
                nextItemElt += ".disabled";
            }
            return m(nextItemElt, {
                         onclick: noScrollAnchorCurry(ctrl.prev)
                     },
                     m("a[href='#']", [
                           m("i.icon.arrow_left")
                       ]
                     )
            );
        }

        function nextItem() {
            var nextItemElt = "li";
            if (!ctrl.hasNext()) {
                nextItemElt += ".disabled";
            }
            return m(nextItemElt, {
                         onclick: noScrollAnchorCurry(ctrl.next)
                     },
                     m("a[href='#']", [
                           m("i.icon.arrow_right")
                       ]
                     )
            );
        }

        function getPaginationIndices(pageCount) {
            return _.times(pageCount);
        }

        function paginationItem(pageIdx) {
            var paginationElt = "li";
            if (ctrl.vm.currentPage() === pageIdx) {
                paginationElt += ".active";
            }
            return m(paginationElt, {
                         onclick: noScrollAnchorCurry(function () {
                             ctrl.to(pageIdx);
                         })
                     },
                     m("a[href='#']", "" + (pageIdx + 1))
            );
        }
    }
})();

