var forSelect = require("../utils/for-select");
var h = require("../utils/html");
var closestParent = require("../utils/closest-parent");
var api = require("../utils/api");
var promPlus = require("../utils/promise-tools");
var IAm = require("../utils/i-am");
var hideTools = require("../utils/hide-tools");

var timeToShow = 1000,
    timeToHide = 500,
    wrapClass = "be-fe-userinfo-wrapper",
    timerShow = null,
    timerHide = null,
    defaultPic = "https://freefeed.net/img/default-userpic-75.png",
    canHide = false;

function isNakedA(el) {
    var link;
    if (el.nodeName == "A") {
        link = el;
    } else if (el.nodeName == "IMG" && el.parentNode.nodeName == "A") {
        link = el.parentNode;
    } else {
        return null;
    }
    return (
    link.hasAttribute("href")
    && link.getAttribute("href").match(/^\/\w+$/)
    && !closestParent(link, "." + wrapClass)
    ) ? link : null;
}

function isInWrapper(el) { return !!closestParent(el, "." + wrapClass, true); }

function wrapLink(el) {
    var wrapper = h("span.be-fe-userinfo-wrapper");
    el.parentNode.insertBefore(wrapper, el);
    wrapper.appendChild(el);
    showInfoWin(el.getAttribute("href").substr(1), wrapper);
}

function showInfoWin(username, wrapper) {
    promPlus
        .all([api.get("/v1/users/" + username), IAm.ready])
        .then(function (resp) {
            var inf = resp[0].users,
                iAm = resp[1];
            if (!inf.id) {
                return;
            }
            if (!inf.profilePictureLargeUrl || inf.profilePictureLargeUrl === "") {
                inf.profilePictureLargeUrl = defaultPic;
            }

            var isUser = (inf.type === "user"); // or "group"

            var role = iAm.whoIs(inf.username),
                roleText;
            if (role & IAm.ME) {
                roleText = "You";
            } else if (role & IAm.FRIEND) {
                roleText = isUser ? "Your friend" : "Your group";
            } else if (role & IAm.READER) {
                roleText = "Your reader";
            } else {
                roleText = isUser ? "Stranger" : "Group";
            }

            if ((role & IAm.FRIEND) && (role & IAm.READER)) {
                roleText = "Your mutual friend";
            }

            var actions = [];
            if (!(role & IAm.ME)) {
                if (isUser) {
                    actions.push(h("span", h("a.a-subs", (role & IAm.FRIEND) ? "Unsubscribe" : "Subscribe")));
                } else {
                    actions.push(h("span", h("a.a-subs", (role & IAm.FRIEND) ? "Leave group" : "Join group")));
                }
                if (canHide && isUser) {
                    var postsBanned = hideTools.postsBanList.contains(inf.username);
                    var commsBanned = hideTools.commsBanList.contains(inf.username);
                    actions.push(h("span", h("a.a-hide-posts", postsBanned ? "Show posts" : "Hide posts")));
                    actions.push(h("span", h("a.a-hide-comms", commsBanned ? "Show comms." : "Hide comms.")));
                }
            }

            var infoWin = h(".be-fe-userinfo-win",
                h("img.be-fe-userinfo-pic", {src: inf.profilePictureLargeUrl}),
                h(".be-fe-userinfo-info",
                    h(".be-fe-userinfo-screenName", h("a.be-fe-nameFixed", {href: "/" + inf.username}, inf.screenName)),
                    h(".be-fe-userinfo-userName", inf.username),
                    h(".be-fe-userinfo-relation", roleText)
                ),
                h(".be-fe-userinfo-actions", {
                    "data-username": inf.username,
                    "data-subscribed": (role & IAm.FRIEND) ? "1" : "",
                    "data-posts-hidden": postsBanned ? "1" : "",
                    "data-comms-hidden": commsBanned ? "1" : ""
                }, actions)
            );
            var oldWin = wrapper.querySelector(".be-fe-userinfo-win");
            if (oldWin) oldWin.parentNode.removeChild(oldWin);
            wrapper.appendChild(infoWin);
        });
}

function unWrapLink(el) {
    var w = closestParent(el, "." + wrapClass, true);
    if (!w) return;
    var link = w.querySelector(":scope > a");
    w.parentNode.insertBefore(link, w);
    w.parentNode.removeChild(w);
}

function linkClick(e) {
    if (e.target.nodeName !== "A") return;
    var link = e.target;
    var act = closestParent(link, ".be-fe-userinfo-actions");
    if (!act) return;
    var wrapper = closestParent(act, "." + wrapClass);
    var username = act.dataset["username"];

    if (link.classList.contains("a-subs")) {
        if (act.dataset["subscribed"]) {
            api.post("/v1/users/" + username + "/" + "unsubscribe").then(function (res) {
                IAm.ready.then(function (iAm) { iAm.unsubscribed(username); });
                showInfoWin(username, wrapper);
            });
        } else {
            api.post("/v1/users/" + username + "/" + "subscribe").then(function (res) {
                IAm.ready.then(function (iAm) { iAm.subscribed(username); });
                showInfoWin(username, wrapper);
            });
        }
    } else if (link.classList.contains("a-hide-posts")) {
        if (act.dataset["postsHidden"]) {
            hideTools.showPostsFrom(username);
        } else {
            hideTools.hidePostsFrom(username);
        }
        showInfoWin(username, wrapper);
    } else if (link.classList.contains("a-hide-comms")) {
        if (act.dataset["commsHidden"]) {
            hideTools.showCommsFrom(username);
        } else {
            hideTools.hideCommsFrom(username);
        }
        showInfoWin(username, wrapper);
    }

}

function linkMouseOver(e) {
    var link = isNakedA(e.target);
    if (link) {
        timerShow = setTimeout(wrapLink.bind(null, link), timeToShow);
    }
    if (isInWrapper(e.target)) {
        clearTimeout(timerHide);
    }
}

function linkMouseOut(e) {
    var link = isNakedA(e.target);
    if (link) {
        clearTimeout(timerShow);
    }
    if (isInWrapper(e.target)) {
        timerHide = setTimeout(unWrapLink.bind(null, e.target), timeToHide);
    }
}

module.exports = function (node, settings) {

    if (!node) {
        document.body.addEventListener("mouseover", linkMouseOver);
        document.body.addEventListener("mouseout", linkMouseOut);
        document.body.addEventListener("click", linkClick);
        canHide = settings["hide"];
    }

    node = node || document.body;
};
