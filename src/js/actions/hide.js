var IAm = require("../utils/i-am");
var hideTools = require("../utils/hide-tools");
var forSelect = require("../utils/for-select");
var h = require("../utils/html");
var closestParent = require("../utils/closest-parent");

module.exports = function (node, settings) {
    if (!settings["where-this-post-from"]) return;

    node = node || document.body;

    hideTools.commsBanList.get().forEach(function (user) {
        forSelect(node, ".be-fe-comment-from-u-" + user + ":not(.be-fe-comment-hidden)", function (node) {
            node.classList.add("be-fe-comment-hidden");
        });
    });

    forSelect(node, ".post-controls > .p-timeline-post-hide-action", function (hideLink) {
        var postNode = closestParent(hideLink, ".timeline-post-container");
        if (!postNode) return;
        var postAuthor = postNode.dataset["postAuthor"];
        if (!postAuthor) return;

        IAm.ready.then(function (iAm) {
            var aType = iAm.whoIs(postAuthor);

            hideLink.innerHTML = "Hide this post";
            var hideAllLink = null;

            if (!(aType & IAm.ME)) {
                hideAllLink = h("a", "Hide all posts from ", h("strong", postAuthor));
                hideAllLink.addEventListener("click", hideTools.hidePostsFrom.bind(hideTools, postAuthor));
            }

            var handlerLink = h("a", "Hide ", h("i.fa.fa-caret-down"));
            var win = null;
            handlerLink.addEventListener("click", function () {
                win.style.display = (win.style.display == "none") ? "block" : "none";
            });

            var ref = hideLink.nextSibling;
            hideLink.parentNode.insertBefore(
                h("span.be-fe-hide-cont",
                    handlerLink,
                    win = h(".be-fe-hide-win",
                        h("ul",
                            h("li", hideLink),
                            hideAllLink ? h("li", hideAllLink) : null
                        )
                    )
                ), ref
            );
            win.style.display = "none";
        });
    });
};