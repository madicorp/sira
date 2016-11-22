(function () {
    var tagItem = _package("com.botilab.components.list").Tag;
    var elementsController = _package("com.botilab.components.list").ElementsController;
    _package("com.botilab.components.list").ListImagesComponent = {
        controller: elementsController,
        view: elementsView
    };

    function elementsView(ctrl) {
        var items = ctrl.vm.items();
        if (!items) {
            return [];
        }
        var listItems = items.map(listItem);
        return m(".projects-container.column-projects.gallery-slider", {config: magnificPopupConfig}, [listItems]);

        function getItemTags(itemData) {
            return itemData.meta.tags.map(function (tagName) {
                return tagItem(tagName, "#", ctrl.getTagState(tagName), ctrl.setTagState);
            });
        }

        function listItem(itemData) {
            return m(".col-md-" + ctrl.md_size + ".col-sm-6.project.image-holder", [
                m(".background-image-holder", m(ctrl.thumbnailComponent(), {itemData: itemData})),
                m(".hover-state", [
                    m(".align-vertical", [
                        m("h3.text-white",
                            m("strong", itemData.title)
                        ),
                        m("a.btn.btn-primary.btn-white.img-caption", {
                                href: itemData.meta.download_url,
                                dataEffect: "mfp-3d-unfold"
                            }, [
                                m("i.fa.fa-expand")
                            ]
                        )
                    ])
                ]),
                m(".img-tags",
                    m(".sidebar-widget", [
                        m("ul.tags", [
                            getItemTags(itemData)
                        ])
                    ])
                )
            ]);
        }

        function magnificPopupConfig(element, init, context) {
            if (!init) {
                $('.img-caption').magnificPopup({
                    preloader: true,
                    type: 'image',
                    removalDelay: 500,
                    gallery: {enabled: true},
                    callbacks: {
                        beforeOpen: function () {
                            this.st.image.markup = this.st.image.markup.replace('mfp-figure', 'mfp-figure mfp-with-anim');
                            this.st.mainClass = this.st.el.attr('data-effect');

                        },
                        beforeClose: function () {
                            var elm = this.st.el;
                            $(elm).parents(".align-vertical").hide();
                        },
                        afterClose: function () {
                            var elm = this.st.el;

                            $(elm).parents(".align-vertical").show();
                        }
                    }
                });
            }
        }
    }
})();
