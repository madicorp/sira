$(document).ready(function () {
    // Initializes tooltips
    $('[title]').tooltip({container: 'body'});

    //Apply img-thumbnail class to body-content images
    $('.body-content img').addClass("img-thumbnail");
});

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