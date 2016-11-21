(function () {
    _package("com.botilab.components.list").ElementsController = elementsController;
    function elementsController(componentArgs) {
        this.vm = {
            items: componentArgs.items
        };
        this.thumbnailComponent = componentArgs.thumbnailComponent;
        this.itemsPerLine = componentArgs.itemsPerLine || 3;
        this.getTagState = componentArgs.getTagState;
        this.setTagState = componentArgs.setTagState;
        this.md_size = componentArgs.md_size || 4;

    }
})();