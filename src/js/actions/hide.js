var IAm = require("../utils/i-am");
var api = require("../utils/api");
var forSelect = require("../utils/for-select");
var h = require("../utils/html");
var closestParent = require("../utils/closest-parent");
var banList = require("../utils/ban-list");

var style = null;

module.exports = function (node, settings) {
    if (!settings["where-this-post-from"]) return;

    if (!node) {
        style = document.head.appendChild(h("style.be-fe-banlist")).sheet;
        banList.get().forEach(cssHide);
    }

    node = node || document.body;

    forSelect(node, ".post-controls > .p-timeline-post-hide-action", function (hideLink) {
        var postNode = closestParent(hideLink, ".timeline-post-container");
        if (!postNode) return;
        var postAuthor = postNode.dataset["postAuthor"];
        if (!postAuthor) return;

        IAm.ready.then(function (iAm) {
            var aType = iAm.whoIs(postAuthor);

            hideLink.innerHTML = "Hide this post";
            var hideAllLink = null;

            if (aType == IAm.FRIEND) {
                hideAllLink = h("a", "Unsubscribe from ", h("strong", postAuthor));
                hideAllLink.addEventListener("click", unsubscribeFrom.bind(null, postAuthor));
            } else if (aType != IAm.ME) {
                hideAllLink = h("a", "Hide all posts from ", h("strong", postAuthor));
                hideAllLink.addEventListener("click", hideAllFrom.bind(null, postAuthor));
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

    function unsubscribeFrom(user) {
        return api.post("/v1/users/" + user + "/unsubscribe").then(cssHide.bind(null, user));
    }

    function hideAllFrom(user) {
        banList.add(user);
        cssHide(user);
    }

    function cssHide(user) {
        style.insertRule(".be-fe-post-from-u-" + user + " { display: none; }", 0);
    }
};