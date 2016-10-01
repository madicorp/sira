(function () {
    var innerComponent = _package("com.botilab.components.list").InnerComponent;
    _package("com.botilab.components.list").listComponentInit = ListComponentInitialise;

    function ListComponentInitialise(containerId, baseListUrl, listItemType) {
        var MainComponent = {
            view: function () {
                return m(innerComponent, {baseListUrl: baseListUrl,listItemType: listItemType});
            }
        };

        m.mount(document.getElementById(containerId), MainComponent);
    }
})();