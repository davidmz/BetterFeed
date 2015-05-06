var forSelect = require("../utils/for-select");
var h = require("../utils/html");

module.exports = function (node) {
    node = node || document.body;

    forSelect(node, ".p-timeline-post > .comments:not(.be-fe-foldApplied)", function (node) {
        node.classList.add("be-fe-foldApplied");
        var comments = node.querySelectorAll(":scope > .ember-view"),
            nComments = comments.length;

        if (nComments <= 7) return;

        var lastComment = comments[nComments - 1];

        for (var i = 1; i < nComments - 1; i++) {
            node.removeChild(comments[i]);
        }

        var foldLink = h("a", (nComments - 2) + " more comments");
        var foldRow = h(".be-fe-comments-fold-handle", foldLink);

        node.insertBefore(foldRow, lastComment);

        foldLink.addEventListener("click", function (e) {
            e.preventDefault();
            node.removeChild(foldRow);
            for (var i = 1; i < nComments - 1; i++) {
                node.insertBefore(comments[i], lastComment);
            }
        });

    });
};
