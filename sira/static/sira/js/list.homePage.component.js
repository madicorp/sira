(function () {
    var listElementsComponent = _package("com.botilab.components.list").ListElementsComponent;
    _package("com.botilab.components.list").homepageDocListComponentInit = ListComponentInitialise;

    function ListComponentInitialise(containerId, baseListUrl, listItemType, itemsKeyInResponse) {
        var MainComponent = {
            controller: function () {
                var vm = {
                    items: m.prop([])
                };
                this.vm = vm;
                updateItems();
                function updateItems() {
                    m.request({
                                  method: "GET",
                                  url: baseListUrl + '?fields=title,created_at,tags&limit=6&offset=0&order=created_at'
                              })
                     .then(function (resp) {
                         var items = resp[itemsKeyInResponse];
                         vm.items(items);
                     });
                }
            },
            view: function (ctrl) {
                return m(listElementsComponent, {
                             items: ctrl.vm.items, getTagState: function () {
                                 return false;
                             },
                             thumbnailComponent: _package("com.botilab.components.list").pdfThumbnailComponent
                         }
                );
            }

        };

        m.mount(document.getElementById(containerId), MainComponent);
    }
})();