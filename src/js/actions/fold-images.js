var forSelect = require("../utils/for-select");
var h = require("../utils/html");
var imgLoaded = require("../utils/img-loaded");
var prom = require("../utils/promise-tools");

module.exports = function (node, settings) {
    node = node || document.body;

    forSelect(node, ".post-body .attachments", function (node) {
        var attaches = forSelect(node, ".attachment");

        if (attaches.length < 4) return;

        var attLoaded = attaches.map(function (n) { return imgLoaded(n.querySelector(".p-attachment-thumbnail")); });
        prom.all(attLoaded).then(function () {
            var nRows = 0,
                topOff = 0,
                nHidden = 0;

            attaches.forEach(function (node) {
                if (node.offsetTop > topOff) {
                    topOff = node.offsetTop;
                    nRows++;
                }
                if (nRows > 1) {
                    node.classList.add("be-fe-hidden-attach");
                    nHidden++;
                }
            });

            if (nRows < 3) return;

            node.classList.add("be-fe-fold-attach");
            var control = node.appendChild(h(".be-fe-fold-attach-arrow")).appendChild(h("i.fa.fa-chevron-circle-right.fa-2x", {title: "+" + nHidden}));
            control.addEventListener("click", function () {
                if (node.classList.contains("be-fe-fold-attach-opened")) {
                    node.classList.remove("be-fe-fold-attach-opened");
                    control.title = "+" + nHidden;
                } else {
                    node.classList.add("be-fe-fold-attach-opened");
                    control.title = "\u2212" + nHidden;
                }
            });
        });
    });
};
