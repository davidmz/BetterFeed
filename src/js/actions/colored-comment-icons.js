var forSelect = require("../utils/for-select");
var h = require("../utils/html");
var closestParent = require("../utils/closest-parent");

var myLogin = null;

module.exports = function (node) {
    node = node || document.body;

    var loggedLink = node.querySelector(".logged-user .author a");
    if (loggedLink) {
        myLogin = loggedLink.href.substr(1);
    }

    forSelect(node, ".post-body", function (node) {
        var postAuthor = node.querySelector(".title a").href.substr(1);
        forSelect(node, ".comment:not(.be-fe-comment-from)", function (node) {
            var authorLink = node.querySelector(".author a");
            if (!authorLink) return;
            var author = authorLink.href.substr(1);
            if (author == myLogin) {
                node.classList.add("be-fe-comment-from-me");
            } else if (author == postAuthor) {
                node.classList.add("be-fe-comment-from-post-author");
            }
            node.classList.add("be-fe-comment-from");
        });
    });

    forSelect(node, ".comment:not(.be-fe-comment-from)", function (node) {
        var postAuthor = closestParent(node, ".post-body").querySelector(".title a").href.substr(1);
        var authorLink = node.querySelector(".author a");
        if (!authorLink) return;
        var author = authorLink.href.substr(1);
        if (author == myLogin) {
            node.classList.add("be-fe-comment-from-me");
        } else if (author == postAuthor) {
            node.classList.add("be-fe-comment-from-post-author");
        }
        node.classList.add("be-fe-comment-from");
    });

    forSelect(node, ".comment .date:not(.be-fe-iconized)", function (node) {
        node.classList.add("be-fe-iconized");
        node.appendChild(h("i.fa.fa-comment.icon.be-fe-ico-bg"));
    });
};

