var forSelect = require("../utils/for-select");
var h = require("../utils/html");

module.exports = function (node) {
    node = node || document.body;

    forSelect(node, ".comment-text, .post-body > .body > .text", function (node) {
        var c = node.firstChild;
        while (c) {
            if (c.nodeType == Node.TEXT_NODE && /\B@([a-z0-9_]+)/.test(c.nodeValue)) {
                var re = /\B@([a-z0-9_]+)/g,
                    str = c.nodeValue,
                    fr = document.createDocumentFragment(),
                    m, ptr = 0;
                while ((m = re.exec(str)) !== null) {
                    var match = m[0], login = m[1], off = m.index;
                    fr.appendChild(document.createTextNode(str.substr(ptr, off - ptr)));
                    ptr = off + match.length;
                    fr.appendChild(h("a", {
                        href: "/" + login,
                        class: "be-fe-at-link",
                        "data-login": login
                    }, document.createTextNode(match)));
                }
                var lastCh = fr.appendChild(document.createTextNode(str.substr(ptr)));
                node.insertBefore(fr, c);
                node.removeChild(c);
                c = lastCh;
            }
            c = c.nextSibling;
        }
    });
};


