var forSelect = require("../utils/for-select");
var h = require("../utils/html");
var closestParent = require("../utils/closest-parent");
var api = require("../utils/api");
var promPlus = require("../utils/promise-tools");
var IAm = require("../utils/i-am");

var timeToShow = 1000,
    timeToHide = 500,
    wrapClass = "be-fe-userinfo-wrapper",
    timerShow = null,
    timerHide = null,
    defaultPic = "https://freefeed.net/img/default-userpic-75.png";

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

            var role = iAm.whoIs(inf.username),
                roleText;
            if (role & IAm.ME) {
                roleText = "You";
            } else if (role & IAm.FRIEND) {
                roleText = "Your friend";
            } else if (role & IAm.READER) {
                roleText = "Your reader";
            } else {
                roleText = "Stranger";
            }

            if ((role & IAm.FRIEND) && (role & IAm.READER)) {
                roleText = "Your mutual friend";
            }

            var action = null, actionLink = null;
            if (role & IAm.FRIEND) {
                action = h("div", "(", actionLink = h("a", {"data-sub": ""}, "unsubscribe"), ")");
            } else if (!(role & IAm.ME)) {
                action = h("div", "(", actionLink = h("a", {"data-sub": "1"}, "subscribe"), ")");
            }

            if (actionLink) {
                actionLink.addEventListener("click", subscrClick.bind(actionLink, inf.username));
            }

            var infoWin = h(".be-fe-userinfo-win",
                h("img.be-fe-userinfo-pic", {src: inf.profilePictureLargeUrl}),
                h(".be-fe-userinfo-info",
                    h(".be-fe-userinfo-screenName", h("a.be-fe-nameFixed", {href: "/" + inf.username}, inf.screenName)),
                    h(".be-fe-userinfo-userName", inf.username),
                    h(".be-fe-userinfo-relation", roleText, action)
                )
            );
            var oldWin = wrapper.querySelector(".be-fe-userinfo-win");
            if (oldWin) oldWin.parentNode.removeChild(oldWin);
            wrapper.appendChild(infoWin);
        });
}

function subscrClick(username) {
    var link = this;
    var wrapper = closestParent(link, "." + wrapClass);
    var doSubscribe = !!link.dataset["sub"];
    api.post("/v1/users/" + username + "/" + (doSubscribe ? "subscribe" : "unsubscribe")).then(function (res) {
        IAm.ready.then(function (iAm) { iAm[doSubscribe ? "subscribed" : "unsubscribed"](username); });
        showInfoWin(username, wrapper);
    });
}

function unWrapLink(el) {
    var w = closestParent(el, "." + wrapClass, true);
    var link = w.querySelector(":scope > a");
    w.parentNode.insertBefore(link, w);
    w.parentNode.removeChild(w);
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

module.exports = function (node) {

    if (!node) {
        document.body.addEventListener("mouseover", linkMouseOver);
        document.body.addEventListener("mouseout", linkMouseOut);
    }

    node = node || document.body;
};
