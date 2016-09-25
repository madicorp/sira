(function () {

    var ListComponent = {
        controller: listController,
        view: listView
    };

    m.mount(document.getElementById("documents"), ListComponent);

    function listView(ctrl) {
        return [
            m("section", [
                  m(".container.list-component", [
                      m(".row", filterRow()),
                      m(".row", listItems()),
                      m(".row", pagination())
                  ])
              ]
            )
        ];

        function filterRow() {
            return [
                m(".col-md-4"),
                m(".col-md-4", filterItem()),
                m(".col-md-4"),
            ];
        }

        function filterItem() {
            return m("input.form-control[type=search][placeholder='Filter...']", {
                oninput: function (e) {
                    ctrl.filter(e.target.value || "");
                }
            });
        }

        function listItems() {
            if (!ctrl.vm.list) {
                return [];
            }
            return ctrl.vm.list().map(listItem);
        }

        function listItem(itemData) {
            return m(".col-md-4", itemData.title);
        }

        function pagination() {
            return [
                m(".col-md-2"),
                m(".col-md-8",
                  m(".text-center",
                    m("nav",
                      m("ul.pagination", paginationItems())
                    )
                  )
                ),
                m(".col-md-8"),
            ];
        }

        function paginationItems() {
            if (!ctrl.vm.pageCount || ctrl.vm.pageCount() < 1) {
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
                         onclick: ctrl.prev
                     },
                     m("a[href='#']",
                       m("span[aria-hidden=true]", m.trust("&laquo;"))
                     )
            );
        }

        function nextItem() {
            var nextItemElt = "li";
            if (!ctrl.hasNext()) {
                nextItemElt += ".disabled";
            }
            return m(nextItemElt, {
                         onclick: ctrl.next
                     },
                     m("a[href='#']",
                       m("span[aria-hidden=true]", m.trust("&raquo;"))
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
                         onclick: function () {
                             ctrl.to(pageIdx);
                         }
                     },
                     m("a[href='#']", "" + (pageIdx + 1))
            );
        }
    }

    function listController() {
        var limit = 15;
        var vm = {
            list: m.prop([]),
            currentPage: m.prop(0),
            pageCount: m.prop(-1),
            filterValue: m.prop()
        };
        this.vm = vm;
        this.hasPrev = hasPrev;
        this.hasNext = hasNext;
        this.next = next;
        this.prev = prev;
        this.filter = filter;
        this.to = to;
        to(vm.currentPage());

        function hasPrev() {
            return vm.currentPage() > 0;
        }

        function hasNext() {
            return vm.currentPage() < (vm.pageCount() - 1);
        }

        function next() {
            if (!hasNext()) {
                return;
            }
            to(vm.currentPage() + 1)
        }

        function prev() {
            if (!hasPrev()) {
                return;
            }
            to(vm.currentPage() - 1)
        }

        function filter(value) {
            to(0, value);
        }

        function to(page, filterValue) {
            if (filterValue === null || filterValue === undefined) {
                filterValue = vm.filterValue();
            }
            vm.filterValue(filterValue);
            var url = "/api/v1/documents?limit=" + limit + "&offset=" + (page * limit);
            if (!!filterValue) {
                url += "&search=" + filterValue;
            } else {
                url += "&order=created_at"
            }
            m.request({method: "GET", url: url})
             .then(function (resp) {
                 console.log(resp);
                 vm.list(resp.documents);
                 vm.pageCount(_.round(resp.meta.total_count / limit, 0) + 1);
             });
            vm.currentPage(page);
        }
    }
})();