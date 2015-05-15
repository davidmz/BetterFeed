var forSelect = require("../utils/for-select");
var h = require("../utils/html");

module.exports = function (node, settings) {
    if (!node) {
        (function (w, d) {
            var id = 'embedly-platform', n = 'script';
            if (!d.getElementById(id)) {
                w.embedly = w.embedly || function () {(w.embedly.q = w.embedly.q || []).push(arguments);};
                var e = d.createElement(n);
                e.id = id;
                e.async = 1;
                e.src = 'https://cdn.embedly.com/widgets/platform.js';
                var s = d.getElementsByTagName(n)[0];
                s.parentNode.insertBefore(e, s);
            }
        })(window, document);

        embedly('on', 'card.rendered', function (iframe) { iframe.style.margin = "10px 0"; });
    }

    node = node || document.body;

    forSelect(node, ".post-body", function (node) {
        if (node.querySelector(":scope > .attachments")) {
            return;
        }

        forSelect(node, ".text a").some(function (link) {
            if (!/^https?:\/\//.test(link.getAttribute("href"))) return false;
            var bodyNext = node.querySelector(":scope > .body").nextSibling;
            node.insertBefore(
                h(".be-fe-embeds", h("a.embedly-card", {href: link.href, "data-card-width": "60%"})),
                bodyNext
            );
            return true;
        });
    });
};
