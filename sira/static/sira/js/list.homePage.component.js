(function () {
    var listDocumentComponent = _package("com.botilab.components.list").ListDocumentComponent;
    _package("com.botilab.components.list").listComponentInit = ListComponentInitialise;

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
                return m(listDocumentComponent, {
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