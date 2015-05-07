var forSelect = require("../utils/for-select");
var h = require("../utils/html");

module.exports = function (node) {
    node = node || document.body;

    forSelect(node, ".p-timeline-post > .comments", function (node) {
        var comments = node.querySelectorAll(":scope > .ember-view"),
            nComments = comments.length,
            i;

        for (i = 0; i < nComments; i++) {
            if (nComments > 7 && i > 0 && i < nComments - 1) {
                comments[i].classList.add("be-fe-comment-folded");
            } else {
                comments[i].classList.remove("be-fe-comment-folded");
            }
        }

        if (nComments <= 7) return;

        var foldRow = node.querySelector(".be-fe-comments-fold-handle");
        if (!foldRow) {
            var foldLink = h("a", (nComments - 2) + " more comments");
            foldRow = h(".be-fe-comments-fold-handle", foldLink);
            foldLink.addEventListener("click", function (e) {
                e.preventDefault();
                node.classList.add("be-fe-comments-expanded");
            });
        } else {
            foldRow.querySelector("a").innerHTML = (nComments - 2) + " more comments";
        }

        node.insertBefore(foldRow, comments[1]);
    });
};
