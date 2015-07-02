var forSelect = require("../utils/for-select");
var h = require("../utils/html");
var IAm = require("../utils/i-am");

module.exports = function (node) {
    node = node || document.body;

    var friendsLink = node.querySelector(".sidebar a[href$='/subscriptions']");
    if (!friendsLink) return;
    friendsLink.innerHTML = "Browse/edit friends and others";

    IAm.ready.then(function (iAm) {
        if (iAm.banIds.length === 0) return;
        if (location.pathname !== "/" + iAm.me + "/subscriptions") return;

        var boxBody = node.querySelector(".content .box-body");
        if (!boxBody || boxBody.querySelector(".be-fe-ban-list")) return;

        boxBody.appendChild(h("h3", "Blocked users"));
    });
};


