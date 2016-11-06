(function () {
    var listElementsComponent = _package("com.botilab.components.list").ListElementsComponent;

    _package("com.botilab.components.list").homepageGenericListComponentInit = ListComponentInitialise;

    function ListComponentInitialise(containerId, baseListUrl, thumbnailComponentProvider, extraApiParams) {
        var extraApiParamsStr = "";
        _.forIn(extraApiParams, function (value, key) {
            extraApiParamsStr += "&" + key + "=" + value;
        });
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
                                  url: baseListUrl + '?fields=title,created_at,tags&limit=6&offset=0&order=created_at' +
                                       extraApiParamsStr,
                              })
                     .then(function (resp) {
                         vm.items(resp['items']);
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
                             thumbnailComponent: thumbnailComponentProvider
                         }
                );
            }

        };

        m.mount(document.getElementById(containerId), MainComponent);
    }
})();