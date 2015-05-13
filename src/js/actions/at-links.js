var forSelect = require("../utils/for-select");
var h = require("../utils/html");
var closestParent = require("../utils/closest-parent");

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
                    var a = fr.appendChild(h("a.be-fe-at-link", {href: "/" + login}, match));
                    hlOver(a, ".be-fe-comment-from-u-" + login);
                }
                var lastCh = fr.appendChild(document.createTextNode(str.substr(ptr)));
                node.insertBefore(fr, c);
                node.removeChild(c);
                c = lastCh;
            }
            c = c.nextSibling;
        }
    });

    // ссылки с ^^^
    forSelect(node, ".comment-text", function (node) {
        var c = node.firstChild;
        while (c) {
            if (c.nodeType == Node.TEXT_NODE && /[↑^]/.test(c.nodeValue)) {
                var re = /↑+|\^+W?/g,
                    str = c.nodeValue,
                    fr = document.createDocumentFragment(),
                    m, ptr = 0;
                while ((m = re.exec(str)) !== null) {
                    var match = m[0], off = m.index;
                    if (match === "^W") {
                        continue;
                    }
                    fr.appendChild(document.createTextNode(str.substr(ptr, off - ptr)));
                    ptr = off + match.length;
                    var a = fr.appendChild(h("span.be-fe-ups", match));
                    var ref = getRefComment(closestParent(node, ".ember-view"), match.length);
                    if (ref) {
                        hlOver(a, "#" + ref.id);
                    }
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

var getRefComment = function (comm, n) {
    var refComm = null;
    while (true) {
        comm = comm.previousElementSibling;
        if (!comm) {
            break
        } else if (comm.classList.contains("ember-view")) {
            n--;
            if (n == 0) {
                refComm = comm;
                break;
            }
        }
    }
    return refComm;
};

var hlOver = function (el, selector) {
    if (el.dataset["hlSelector"]) return;
    el.dataset["hlSelector"] = selector;
    el.addEventListener("mouseover", linkMouseOver);
    el.addEventListener("mouseout", linkMouseOut);
};

var linkMouseOver = function (e) {
    var selector;
    if ((selector = e.target.dataset["hlSelector"])) {
        forSelect(closestParent(e.target, ".comments"), selector, function (node) {
            node.classList.add("be-fe-comment-hl");
        });
    }
};
var linkMouseOut = function (e) {
    forSelect(closestParent(e.target, ".comments"), ".be-fe-comment-hl", function (node) {
        node.classList.remove("be-fe-comment-hl");
    });
};
