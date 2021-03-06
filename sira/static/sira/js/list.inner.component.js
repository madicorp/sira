(function () {
    var listTagComponent = _package("com.botilab.components.list").ListTagComponent;
    var listDocumentComponent = _package("com.botilab.components.list").ListDocumentComponent;
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
                        m(listDocumentComponent, {items:  ctrl.vm.items, getTagState:  ctrl.getTagState})
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

