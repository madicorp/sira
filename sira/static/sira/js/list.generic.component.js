(function () {
    var innerComponent = _package("com.botilab.components.list").InnerComponent;
    _package("com.botilab.components.list").genericListComponentInit = ListComponentInitialise;

    function ListComponentInitialise(containerId, baseListUrl, listItemType, itemsKeyInResponse, thumbnailComponent,
                                     itemsPerLine, itemsPerPage) {
        var MainComponent = {
            view: function () {
                return m(innerComponent,
                         {
                             baseListUrl: baseListUrl,
                             listItemType: listItemType,
                             itemsKeyInResponse: itemsKeyInResponse,
                             thumbnailComponent: thumbnailComponent,
                             itemsPerLine: itemsPerLine,
                             itemsPerPage: itemsPerPage,
                         });
            }
        };

        m.mount(document.getElementById(containerId), MainComponent);
    }
})();