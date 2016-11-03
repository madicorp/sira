/**
 * Created by a621217 on 10/10/2016.
 */

/**
 * Returns an object representing the package to avoid collision in the window scope.
 * If it already exists, it just returns it.
 * @param packageName string separated by '.'
 */
function _package(packageName) {
    var packageItems = packageName.split(".");
    var packageRoot = packageItems.reverse().pop();
    if (!!window[packageRoot]) {
        return packageItems.reverse().reduce(function (prevPackage, packageItem) {
            if (!prevPackage.hasOwnProperty(packageItem)) {
                prevPackage[packageItem] = {};
            }
            return prevPackage[packageItem];
        }, window[packageRoot]);
    }
    window[packageRoot] = {};
    var previousPackage = window[packageRoot];
    while (packageItems.length > 0) {
        var packageItem = packageItems.pop();
        previousPackage[packageItem] = {};
        previousPackage = previousPackage[packageItem];
    }
    return previousPackage;
}

(function () {
    _package("com.botilab.components").noScrollAnchorCurry = noScrollAnchorCurry;
    _package("com.botilab.components").getUrlSearch = getUrlSearch;
    _package("com.botilab.components").getQueryParam = getQueryParam;

    function noScrollAnchorCurry(fn) {
        return function (evt) {
            fn(evt);
            evt.preventDefault();
        }
    }

    function getUrlSearch() {
        return window.location.search.substring(1);
    }

    function getQueryParam(paramName) {
        var query = getUrlSearch();
        var vars = query.split("&");
        for (var i = 0; i < vars.length; i++) {
            var pair = vars[i].split("=").map(decodeURIComponent);
            if (pair[0] == paramName) {
                return pair[1];
            }
        }
        if (console && console.trace) {
            console.trace("query param " + paramName + " not found");
        }
        return undefined;
    }
})();