var forSelect = require("../utils/for-select");
var BanList = require("../utils/ban-list");
var h = require("../utils/html");
var docLoaded = require("./doc-loaded");

var style = null;

var postsBanList = new BanList("be-fe.banList"),
    commsBanList = new BanList("be-fe.banListComms");

docLoaded.then(function () {
    style = document.head.appendChild(h("style.be-fe-banlist")).sheet;
    postsBanList.get().forEach(hidePostsFrom);
});

function hidePostsFrom(user) {
    postsBanList.add(user);
    style.insertRule(".be-fe-post-from-u-" + user + " { display: none; }", 0);
}

function showPostsFrom(user) {
    postsBanList.remove(user);
    var selector = ".be-fe-post-from-u-" + user;
    Array.prototype.slice.call(style.rules).some(function (rule, n) {
        if (rule.selectorText === selector) {
            style.deleteRule(n);
            return true;
        }
        return false;
    });
}

function hideCommsFrom(user) {
    commsBanList.add(user);
    commsBanList.get().forEach(function (user) {
        forSelect(document.body, ".be-fe-comment-from-u-" + user + ":not(.be-fe-comment-hidden)", function (node) {
            node.classList.add("be-fe-comment-hidden");
        });
    });
}

function showCommsFrom(user) {
    commsBanList.remove(user);
    forSelect(document.body, ".be-fe-comment-from-u-" + user + ".be-fe-comment-hidden", function (node) {
        node.classList.remove("be-fe-comment-hidden");
    });
}

module.exports = {
    postsBanList: postsBanList,
    commsBanList: commsBanList,

    hidePostsFrom: hidePostsFrom,
    showPostsFrom: showPostsFrom,

    hideCommsFrom: hideCommsFrom,
    showCommsFrom: showCommsFrom
};