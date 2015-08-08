var forSelect = require("../utils/for-select");
var api = require("../utils/api");
var promPlus = require("../utils/promise-tools");
var h = require("../utils/html");
var IAm = require("../utils/i-am");

module.exports = function (node) {
    node = node || document.body;

    var m = /^\/([a-z0-9-]+)\/(subscriptions|subscribers)$/.exec(location.pathname);
    if (!m) return;

    var userName = m[1],
        listName = m[2],
        n;

    if (listName === "subscribers" && (n = node.querySelector(".p-user-subscribers"))) {
        IAm.ready.then((iAm) => {
            if (iAm.whoIs(userName) & IAm.ME) {
                decorateMutualFriends(iAm, n.nextElementSibling, "p-user-subscriber");
            } else {
                decorateGroupAdmins(userName, n.nextElementSibling);
            }
        });
    }

    if (listName === "subscriptions" && (n = node.querySelector(".p-timeline-subscription-users-header"))) {
        IAm.ready.then((iAm) => {
            if (iAm.whoIs(userName) & IAm.ME) {
                decorateMutualFriends(iAm, n.nextElementSibling, "p-timeline-subscription-user");
            }
        });
    }

};

function decorateMutualFriends(iAm, node, chClass) {
    forSelect(node, `.${chClass} a`, (a) => {
        var un = a.getAttribute("href").substr(1);
        if ((iAm.whoIs(un) & (IAm.FRIEND | IAm.READER)) === (IAm.FRIEND | IAm.READER)) {
            a.classList.add("be-fe-mutual-friend");
            a.appendChild(h(".be-fe-mutual-friend--crown", {title: "Mutual friend"}));
        }
    });
}

function decorateGroupAdmins(userName, node) {
    promPlus
        .all([api.get(`/v1/users/${userName}`), api.get(`/v1/users/${userName}/subscribers`)])
        .then((resp) => {
            var inf = resp[0].users, subscr = resp[1];
            if (!inf.id || inf.type !== "group") return;

            subscr.subscribers
                .filter((s) => (inf.administrators.indexOf(s.id) !== -1))
                .map((s) => s.username)
                .forEach((username) => {
                    var a = document.querySelector(`.p-user-subscriber a[href="/${username}"]:not(.be-fe-group-admin)`);
                    if (a) {
                        a.classList.add("be-fe-group-admin");
                        a.appendChild(h(".be-fe-group-admin--crown", {title: "Administrator"}));
                    }
                });
        });
}