(function () {
    var listElementsComponent = _package("com.botilab.components.list").ListElementsComponent;
    var documentThumbnailComponentProvider = _package("com.botilab.components.list").documentThumbnailComponentProvider;
    _package("com.botilab.components.list").homepageDocListComponentInit = ListComponentInitialise;

    function ListComponentInitialise(containerId, baseListUrl) {
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
                         var items = resp['items'];
                         vm.items(items);
                     });
                }
            },
            view: function (ctrl) {
                return m(listElementsComponent, {
                             items: ctrl.vm.items,
                             getTagState: function () {
                                 return false;
                             },
                             setTagState: function () {
                             },
                             thumbnailComponent: documentThumbnailComponentProvider
                         }
                );
            }

        };

        m.mount(document.getElementById(containerId), MainComponent);
    }
})();