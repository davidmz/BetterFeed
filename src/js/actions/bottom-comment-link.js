var forSelect = require("../utils/for-select");
var h = require("../utils/html");
var closestParent = require("../utils/closest-parent");

module.exports = function (node) {
    node = node || document.body;

    forSelect(node, ".p-timeline-post-comment-action:not(.be-fe-copied)", function (node) {
        node.classList.add("be-fe-copied");
        var post = closestParent(node, ".post-body");
        if (!post) return;

        var link = node.cloneNode();
        link.innerHTML = "Add comment";
        var cont = h(".be-fe-bottom-comment-link", link);
        post.querySelector(".comments").appendChild(cont);
    });
};
