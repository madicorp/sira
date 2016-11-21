(function () {
    var listTagComponent = _package("com.botilab.components.list").ListTagComponent;
    var listElementsComponent = _package("com.botilab.components.list").ListElementsComponent;
    var noScrollAnchorCurry = _package("com.botilab.components").noScrollAnchorCurry;
    var listController = _package("com.botilab.components.list").InnerController;


    _package("com.botilab.components.list").InnerComponent = {
        controller: listController,
        view: listView
    };

    function listView(ctrl) {
        var paginationComp = pagination();
        var elementsComponent = ctrl.CustomlistElementsComponent || listElementsComponent;
        return m("", [
            filterComp(),
            paginationComp,
            m(".container", [
                m(".row", [
                    m(".col-sm-9.col-md-9", [
                        m(elementsComponent, {
                            items: ctrl.vm.items,
                            getTagState: ctrl.getTagState,
                            setTagState: ctrl.setTagState,
                            thumbnailComponent: ctrl.thumbnailComponent,
                            itemsPerLine: ctrl.itemsPerLine,
                            md_size: ctrl.md_size
                        })
                    ]),
                    m(".col-sm-3.col-md-3.side___block", [
                        m(listTagComponent, {
                            tagActiveStates: ctrl.vm.tagActiveStates,
                            getTagState: ctrl.getTagState,
                            setTagState: ctrl.setTagState,
                            listItemType: ctrl.listItemType
                        })
                    ])
                ])
            ]),
            paginationComp
        ]);


        function filterComp() {
            return [
                m(".container", [
                    m(".row", [
                        m(".col-sm-3.text-center"),
                        m(".col-sm-6.text-center", [
                            m(".sidebar-widget", [
                                m("h5.widget-title"),
                                m("form.comment-form", {
                                    onsubmit: function (e) {
                                        var query = e.target.querySelector('#search').value;
                                        ctrl.filter(query || "");
                                        return false;
                                    }
                                }, [
                                      m(".input-group", [
                                          filterItem(),
                                          m(".input-group-addon", [
                                              m("i.glyphicon.glyphicon-search")
                                          ])
                                      ])
                                  ])
                            ])
                        ])
                    ])
                ])
            ];
        }

        function filterItem() {
            var filterInputSelector = "input.form-control[id=search][type=text][placeholder='Recherche...']";
            var filterValue = ctrl.vm.filterValue();
            if (!ctrl.nullNorUndefined(filterValue)) {
                filterInputSelector += "[value='" + filterValue + "']";
            }
            return m(filterInputSelector);
        }


        function pagination() {
            return [
                m(".container", [
                    m(".row", [
                        m(".col-sm-12.text-center", [
                            m("ul.pagination.pagination-md", [
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
                           "<"
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
                           ">"
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

