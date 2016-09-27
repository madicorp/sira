(function () {
    var innerComponent = _package("com.botilab.components.list").InnerComponent;
    var listTagComponent = _package("com.botilab.components.list").ListTagComponent;
    _package("com.botilab.components.list").listComponentInit = ListComponentInitialise;

    function ListComponentInitialise(containerId, baseListUrl, listItemType) {
        var MainComponent = {
            view: function () {
                return m(".container", [
                    m(".row.list-component", [
                        m(".col-md-9", m(innerComponent, {baseListUrl: baseListUrl})),
                        m(".col-md-3", m(listTagComponent, {listItemType: listItemType}))
                    ])
                ]);
            }
        };

        m.mount(document.getElementById(containerId), MainComponent);
    }
})();