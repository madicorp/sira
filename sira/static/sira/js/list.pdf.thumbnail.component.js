(function () {
    _package("com.botilab.components.list").pdfThumbnailComponent = {
        controller: pdfThumbnailController,
        view: pdfThumbnailView,
    };

    function pdfThumbnailController(componentArgs) {
        var vm = {
            page: m.prop()
        };
        this.vm = vm;

        PDFJS.getDocument(componentArgs.pdfUrl)
             .then(function (pdf) {
                 return pdf.getPage(1);
             })
             .then(function (page) {
                 m.startComputation();
                 vm.page(page);
                 m.endComputation();
             });
    }

    function pdfThumbnailView(ctrl) {
        var vm = ctrl.vm;
        return m(".col-md-4", {config: renderPdf});

        function renderPdf(divContainer) {
            var page = vm.page();
            divContainer.innerHTML = '';
            if (!page) {
                var divLoader = divContainer.appendChild(document.createElement('div'));
                divLoader.className += "loader";
                var divSpinner = divLoader.appendChild(document.createElement('div'));
                divSpinner.className += "spinner";
                var divBounce1 = divSpinner.appendChild(document.createElement('div'));
                divBounce1.className += "double-bounce1";
                var divBounce2 = divSpinner.appendChild(document.createElement('div'));
                divBounce2.className += "double-bounce2";
            } else {
                var canvas = divContainer.appendChild(document.createElement('canvas'));
                var context = canvas.getContext('2d');
                var desiredWidth = 100;
                var viewport = page.getViewport(1);
                var scale = desiredWidth / viewport.width;
                var scaledViewport = page.getViewport(scale);

                canvas.width = desiredWidth;
                canvas.height = scale * viewport.height;

                var renderContext = {
                    canvasContext: context,
                    viewport: scaledViewport
                };
                page.render(renderContext);
            }
        }
    }
})();