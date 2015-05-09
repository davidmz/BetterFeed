var forSelect = require("../utils/for-select");
var closestParent = require("../utils/closest-parent");
var IAm = require("../utils/user-type");

var myLogin = null;

module.exports = function (node) {
    node = node || document.body;

    var loggedLink = node.querySelector(".logged-user .author a");
    if (loggedLink) {
        myLogin = loggedLink.getAttribute("href").substr(1);
    }

    forSelect(node, ".post-body", function (node) {
        var postAuthor = node.querySelector(".title a").getAttribute("href").substr(1);
        forSelect(node, ".comment:not(.be-fe-comment-from)", function (node) {
            var authorLink = node.querySelector(".author a");
            if (!authorLink) return;
            var author = authorLink.getAttribute("href").substr(1);
            IAm.ready.then(function (iAm) {
                var type = iAm.whoIs(author);
                if (type === IAm.ME) {
                    node.classList.add("be-fe-comment-from-me");
                } else if (type === IAm.FRIEND) {
                    node.classList.add("be-fe-comment-from-friend");
                } else if (type === IAm.READER) {
                    node.classList.add("be-fe-comment-from-reader");
                } else if (type === IAm.STRANGER) {
                    // pass
                }
            });
            if (author == postAuthor) {
                node.classList.add("be-fe-comment-from-post-author");
            }
            node.classList.add("be-fe-comment-from");
            node.classList.add("be-fe-comment-from-u-" + author);
            node.dataset["author"] = author;
        });
    });

    forSelect(node, ".comment:not(.be-fe-comment-from)", function (node) {
        var postAuthor = closestParent(node, ".post-body").querySelector(".title a").getAttribute("href").substr(1);
        var authorLink = node.querySelector(".author a");
        if (!authorLink) return;
        var author = authorLink.getAttribute("href").substr(1);
        if (author == myLogin) {
            node.classList.add("be-fe-comment-from-me");
        } else if (author == postAuthor) {
            node.classList.add("be-fe-comment-from-post-author");
        }
        node.classList.add("be-fe-comment-from");
        node.classList.add("be-fe-comment-from-u-" + author);
        node.dataset["author"] = author;
    });
};

