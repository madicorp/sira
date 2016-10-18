(function () {
    var innerComponent = _package("com.botilab.components.list").InnerComponent;
    _package("com.botilab.components.list").listComponentInit = ListComponentInitialise;

    function ListComponentInitialise(containerId, baseListUrl, listItemType, itemsKeyInResponse) {
        var MainComponent = {
            view: function () {
                return m(innerComponent,
                         {baseListUrl: baseListUrl, listItemType: listItemType, itemsKeyInResponse: itemsKeyInResponse});
            }
        };

        m.mount(document.getElementById(containerId), MainComponent);
    }
})();