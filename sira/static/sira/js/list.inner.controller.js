(function () {
    var getQueryParam = _package("com.botilab.components").getQueryParam;
    _package("com.botilab.components.list").InnerController = listController;

    function listController(componentArgs) {
        var baseListUrl = componentArgs.baseListUrl;
        var itemsKeyInResponse = componentArgs.itemsKeyInResponse;
        var limit = componentArgs.itemsPerPage || 9;
        var vm = {
            items: m.prop([]),
            tagActiveStates: m.prop({}),
            currentPage: m.prop(0),
            pageCount: m.prop(-1),
            filterValue: m.prop()
        };
        this.CustomlistElementsComponent = componentArgs.listElementsComponent;
        this.md_size = componentArgs.md_size;
        this.vm = vm;
        this.hasPrev = hasPrev;
        this.hasNext = hasNext;
        this.next = next;
        this.prev = prev;
        this.filter = filter;
        this.reset = reset;
        this.setTagState = setTagState;
        this.getTagState = getTagState;
        this.nullNorUndefined = nullOrUndefined;
        this.to = to;
        this.listItemType = componentArgs.listItemType;
        this.thumbnailComponent = componentArgs.thumbnailComponent;
        this.itemsPerLine = componentArgs.itemsPerLine;
        var extraApiParams = componentArgs.extraApiParams;
        var activeTags;
        updateListFromBrowserHash();
        window.onpopstate = updateListFromBrowserHash;

        function updateListFromBrowserHash(e) {
            activeTags = getQueryParam("tags") ? getQueryParam("tags").split("+") : [];
            to(vm.currentPage(), getQueryParam("query"), activeTags, true);
        }


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
            to(vm.currentPage() + 1, vm.filterValue())
        }

        function prev() {
            if (!hasPrev()) {
                return;
            }
            to(vm.currentPage() - 1, vm.filterValue())
        }

        function filter(value, activeTags) {
            to(0, value, activeTags);
        }

        function reset() {
            vm.tagActiveStates({});
            to(0, undefined);
        }

        function nullOrUndefined(obj) {
            return obj === null || obj === undefined;
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

        function to(page, filterValue, activeTags, fromBrowserHistory) {
            if (fromBrowserHistory) {
                // reinit tag active states
                vm.tagActiveStates({});
            }
            if (_nonEmptyArray(activeTags)) {
                activeTags.forEach(function activateTag(tagName) {
                    vm.tagActiveStates()[tagName] = true;
                });
            }
            activeTags = _getActiveTags();
            _updateFilter(filterValue, activeTags, fromBrowserHistory);
            var apiQueryUrl = _getApiQueryUrl(page);
            _updateItemsAndTagsStates(apiQueryUrl);
            vm.currentPage(page);
        }

        function _updateFilter(filterValue, activeTags, fromBrowserHistory) {
            var filterValueParams = _updateFilterValue(filterValue);
            var tagsParams = _updateTags(activeTags);
            // The 2 previous methods return the params after update
            // But the last is the most up to date
            // That's why we push it once in the browser history
            var params = '?';
            _.forIn(_.merge(filterValueParams, tagsParams), function (value, key) {
                params += ('&' + key + '=' + value)
            });
            if (!fromBrowserHistory) {
                // We only write to browser history if we are not navigating in browser history
                window.history.pushState({}, window.document.title, params);
            }
        }

        function _updateFilterValue(filterValue) {
            vm.filterValue(filterValue);
            if (vm.filterValue() && "" !== vm.filterValue()) {
                return {"query": vm.filterValue()};
            }
            return {};
        }

        function _updateTags(activeTags) {
            if (nullOrUndefined(activeTags) || activeTags.length === 0) {
                return {};
            }
            return {"tags": activeTags.join("+")};
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
            if (extraApiParams) {
                _.forIn(extraApiParams, function (value, key) {
                    url += "&" + key + "=" + value;
                });
            }
            return url;
        }

        function _updateItemsAndTagsStates(apiQueryUrl) {
            m.request({method: "GET", url: apiQueryUrl})
             .then(function (resp) {
                 var items = init_items(resp);
                 vm.items(items);
                 var tagsActiveStates = _getTagsStates(items);
                 vm.tagActiveStates(tagsActiveStates);
                 vm.pageCount(_.round(resp.meta.total_count / limit, 0));
             });
        }

        function init_items(resp) {
            var items = resp[itemsKeyInResponse];
            items.forEach(function (item) {
                item.tags = item.tags || [];
            });
            return items;
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

