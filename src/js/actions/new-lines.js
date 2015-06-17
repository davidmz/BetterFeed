var forSelect = require("../utils/for-select");
require('../../less/new-lines.less');

var replaceTextNode = function (node, re, str) {
    if (node.nodeType == Node.TEXT_NODE) node.nodeValue = node.nodeValue.replace(re, str);
};

module.exports = function (node) {
    if (node === undefined) {
        document.addEventListener("keydown", function (e) {
            if (e.keyCode === 13 && e.target.tagName == "TEXTAREA" && e.target.classList.contains("ember-text-area")) {
                if (e.shiftKey) {
                    var ta = e.target, t = ta.value, ss = ta.selectionStart;
                    ta.value = t.substr(0, ss) + "\n" + t.substr(ta.selectionEnd);
                    ta.setSelectionRange(ss + 1, ss + 1);
                }
            }
        }, true);

        document.addEventListener("keyup", function (e) {
            if (e.keyCode === 13 && e.target.tagName == "TEXTAREA" && e.target.classList.contains("ember-text-area")) {
                if (e.shiftKey) e.stopPropagation();
            }
        }, true);
    }

    node = node || document.body;

    forSelect(node, ".comment-text, .post-body .text", function (node) {
        replaceTextNode(node.firstChild, /^\s+/, "");
        replaceTextNode(node.lastChild, /\s+$/, "");

        var c = node.firstChild;
        while (c) {
            replaceTextNode(c, /\n{3,}/, "\n\n");
            c = c.nextSibling;
        }
    });
};

