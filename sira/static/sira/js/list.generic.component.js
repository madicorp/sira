(function () {
    var innerComponent = _package("com.botilab.components.list").InnerComponent;
    _package("com.botilab.components.list").genericListComponentInit = ListComponentInitialise;

    function ListComponentInitialise(containerId, baseListUrl, listItemType, itemsKeyInResponse, thumbnailComponentProvider,
                                     itemsPerLine, itemsPerPage, extraApiParams) {
        var thumbnailComponentProviderFn;
        if (!_.isFunction(thumbnailComponentProvider)) {
            thumbnailComponentProviderFn = function () {
                return thumbnailComponentProvider;
            }
        } else {
            thumbnailComponentProviderFn = thumbnailComponentProvider;
        }
        var MainComponent = {
            view: function () {
                return m(innerComponent,
                         {
                             baseListUrl: baseListUrl,
                             listItemType: listItemType,
                             itemsKeyInResponse: itemsKeyInResponse,
                             thumbnailComponent: thumbnailComponentProviderFn,
                             itemsPerLine: itemsPerLine,
                             itemsPerPage: itemsPerPage,
                             extraApiParams: extraApiParams,
                         });
            }
        };

        m.mount(document.getElementById(containerId), MainComponent);
    }
})();