var forSelect = require("../utils/for-select");
require('../../less/direct-style.less');

module.exports = function (node, settings) {
    node = node || document.body;

    forSelect(node, ".direct-post > .title", (title) => {
        var addressees = forSelect(title, ".post-addressee");
        if (addressees.length == 0) {
            return;
        }
        var authorHref = title.querySelector(".post-author").getAttribute("href");
        var n, c = addressees[0], p = c.parentNode;
        while (c) {
            n = c.nextSibling;
            p.removeChild(c);
            c = n;
        }

        addressees
            .filter((a) => {
                return (!a.classList.contains("post-addressee-direct") || a.getAttribute("href") != authorHref);
            })
            .forEach((a, n, arr) => {
                if (n > 0) {
                    p.appendChild(document.createTextNode((n === arr.length - 1) ? " and " : ", "));
                }
                p.appendChild(a);
                if (settings["fix-names"] && a.getAttribute("href") === authorHref) {
                    p.appendChild(document.createTextNode("\u2019" + ((authorHref.substr(-1) !== "s") ? "s" : "") + " feed"));
                }
            });
    });
};

