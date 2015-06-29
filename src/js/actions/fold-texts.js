var forSelect = require("../utils/for-select");
var h = require("../utils/html");

var triggerHeight = 150;

module.exports = function (node) {
    node = node || document.body;

    forSelect(node, ".p-timeline-post .comment-text, .p-timeline-post .body .text", function (node) {
        if (node.offsetHeight < triggerHeight) return;
        node.classList.add("be-fe-folded-text");
        var link = null;
        node.appendChild(h(".be-fe-folded-text-read-more", link = h("a", "Read more\u2026")));
        link.addEventListener("click", function () {
            node.classList.remove("be-fe-folded-text");
        });
    });
};
