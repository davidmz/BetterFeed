var forSelect = require("../utils/for-select");
var closestParent = require("../utils/closest-parent");
var IAm = require("../utils/i-am");

var myLogin = null;

module.exports = function (node) {
    node = node || document.body;

    if (!myLogin) {
        var loggedLink = node.querySelector(".logged-user .author a");
        if (loggedLink) {
            myLogin = loggedLink.getAttribute("href").substr(1);
        }
    }

    forSelect(node, ".comment:not(.be-fe-comment-from)", function (node) {
        var postBody = closestParent(node, ".post-body");
        if (!postBody) return;

        var postAuthor = postBody.querySelector(".title a").getAttribute("href").substr(1);
        var authorLink = node.querySelector(".author a");
        if (!authorLink) {
            if (node.classList.contains("p-timeline-comment")) {
                node.classList.add("be-fe-comment-from");
                node.classList.add("be-fe-comment-from-me");
            }
            return;
        }
        var author = authorLink.getAttribute("href").substr(1);
        IAm.ready.then(function (iAm) {
            var type = iAm.whoIs(author);
            if (type & IAm.ME) {
                node.classList.add("be-fe-comment-from-me");
            } else if (type & IAm.FRIEND) {
                node.classList.add("be-fe-comment-from-friend");
            } else if (type & IAm.READER) {
                node.classList.add("be-fe-comment-from-reader");
            }
        });
        if (author == postAuthor) {
            node.classList.add("be-fe-comment-from-post-author");
        }
        node.classList.add("be-fe-comment-from");
        node.classList.add("be-fe-comment-from-u-" + author);
        node.dataset["author"] = author;
    });
};

