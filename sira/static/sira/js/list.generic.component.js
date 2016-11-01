(function () {
    var innerComponent = _package("com.botilab.components.list").InnerComponent;
    _package("com.botilab.components.list").genericListComponentInit = ListComponentInitialise;

    function ListComponentInitialise(containerId, baseListUrl, listItemType, itemsKeyInResponse, thumbnailComponent,
                                     itemsPerLine) {
        var MainComponent = {
            view: function () {
                return m(innerComponent,
                         {
                             baseListUrl: baseListUrl,
                             listItemType: listItemType,
                             itemsKeyInResponse: itemsKeyInResponse,
                             thumbnailComponent: thumbnailComponent,
                             itemsPerLine: itemsPerLine
                         });
            }
        };

        m.mount(document.getElementById(containerId), MainComponent);
    }
})();