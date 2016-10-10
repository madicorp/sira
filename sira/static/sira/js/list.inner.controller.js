(function () {
    var getQueryParam = _package("com.botilab.components").getQueryParam;
    var insertParam = _package("com.botilab.components").insertParam;
    var deleteParam = _package("com.botilab.components").deleteParam;

    _package("com.botilab.components.list").InnerController = listController;

    function listController(componentArgs) {
        var baseListUrl = componentArgs.baseListUrl;
        var itemsKeyInResponse = componentArgs.itemsKeyInResponse;
        var limit = 2;
        var vm = {
            items: m.prop([]),
            tagActiveStates: m.prop({}),
            currentPage: m.prop(0),
            pageCount: m.prop(-1),
            filterValue: m.prop()
        };
        this.vm = vm;
        this.hasPrev = hasPrev;
        this.hasNext = hasNext;
        this.next = next;
        this.prev = prev;
        this.filter = filter;
        this.setTagState = setTagState;
        this.getTagState = getTagState;
        this.nullNorUndefined = nullNorUndefined;
        this.to = to;
        this.tagArgs = componentArgs.listItemType;
        var activeTags = getQueryParam("tags") ? getQueryParam("tags").split("+") : [];
        to(vm.currentPage(), getQueryParam("query"), activeTags);

        function hasPrev() {
            return vm.currentPage() > 0;
        }

        function hasNext() {
            return vm.currentPage() < (vm.pageCount() - 1);
        }

        function next() {
            if (!hasNext()) {
                return;
            }
            to(vm.currentPage() + 1)
        }

        function prev() {
            if (!hasPrev()) {
                return;
            }
            to(vm.currentPage() - 1)
        }

        function filter(value) {
            to(0, value);
        }

        function nullNorUndefined(filterValue) {
            return filterValue === null || filterValue === undefined;
        }

        function _nonEmptyArray(array) {
            return !!array && array.length > 0;
        }

        function setTagState(tagName, state) {
            var tagsActiveStates = vm.tagActiveStates();
            tagsActiveStates[tagName] = state;
            to(0, vm.filterValue(), _getActiveTags());
        }

        function _getActiveTags() {
            var tagsActiveStates = vm.tagActiveStates();
            return _.keys(tagsActiveStates).filter(function onlyActiveTags(tagName) {
                return tagsActiveStates[tagName];
            });
        }

        function getTagState(tagName) {
            return vm.tagActiveStates()[tagName];
        }

        function to(page, filterValue, activeTags) {
            if (_nonEmptyArray(activeTags)) {
                activeTags.forEach(function activateTag(tagName) {
                    vm.tagActiveStates()[tagName] = true;
                });
            }
            activeTags = _getActiveTags();
            _updateFilter(filterValue, activeTags);
            var apiQueryUrl = _getApiQueryUrl(page);
            _updateItemsAndTagsStates(apiQueryUrl);
            vm.currentPage(page);
        }

        function _updateFilter(filterValue, activeTags) {
            _updateFilterValue(filterValue);
            var params = _updateTags(activeTags);
            // The 2 previous methods return the params after update
            // But the last is the most up to date
            // That's why we push it once in the browser history
            window.history.pushState({}, window.document.title, params);
        }

        function _updateFilterValue(filterValue) {
            if (nullNorUndefined(filterValue)) {
                filterValue = vm.filterValue();
            }
            vm.filterValue(filterValue);
            if (vm.filterValue() && "" !== vm.filterValue()) {
                return insertParam("query", vm.filterValue())
            }
            return deleteParam("query");
        }

        function _updateTags(activeTags) {
            if (nullNorUndefined(activeTags) || activeTags.length === 0) {
                return deleteParam("tags");
            }
            return insertParam("tags", activeTags.join("+"))
        }

        function _getApiQueryUrl(page) {
            var url = baseListUrl + "?fields=title,created_at,tags&limit=" + limit + "&offset=" + (page * limit);
            var search = false;
            if (!!vm.filterValue()) {
                url += "&search=" + vm.filterValue();
                search = true;
            }
            var activeTags = _getActiveTags();
            if (_nonEmptyArray(activeTags)) {
                var tagsSearch = activeTags.join("+");
                url += (search ? "+" + tagsSearch : "&search=" + tagsSearch);
                search = true;
            }
            if (!search) {
                url += "&order=created_at"
            }
            return url;
        }

        function _updateItemsAndTagsStates(apiQueryUrl) {
            m.request({method: "GET", url: apiQueryUrl})
             .then(function (resp) {
                 console
                 var items = resp[itemsKeyInResponse];
                 vm.items(items);
                 var tagsActiveStates = _getTagsStates(items);
                 vm.tagActiveStates(tagsActiveStates);
                 vm.pageCount(_.round(resp.meta.total_count / limit, 0));
             });
        }

        function _getTagsStates(items) {
            return items.reduce(function (tagsActiveStates, item) {
                _setTagStatesForItem(tagsActiveStates, item);
                return tagsActiveStates;
            }, vm.tagActiveStates());
        }

        function _setTagStatesForItem(tagsActiveStates, item) {
            item.tags.forEach(function (tagName) {
                tagsActiveStates[tagName] = getTagState(tagName) || false;
            });
        }
    }
})();

