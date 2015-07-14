var forSelect = require("../utils/for-select");
var api = require("../utils/api");
var promPlus = require("../utils/promise-tools");
var h = require("../utils/html");

module.exports = function (node) {
    node = node || document.body;

    if (!node.querySelector("h3.p-user-subscribers")) return;

    var username = location.pathname.split("/")[1];

    promPlus
        .all([api.get(`/v1/users/${username}`), api.get(`/v1/users/${username}/subscribers`)])
        .then((resp) => {
            var inf = resp[0].users, subscr = resp[1];
            if (!inf.id || inf.type !== "group") return;

            subscr.subscribers
                .filter((s) => (inf.administratorIds.indexOf(s.id) !== -1))
                .map((s) => s.username)
                .forEach((username) => {
                    var a = document.querySelector(`.p-user-subscriber a[href="/${username}"]:not(.be-fe-group-admin)`);
                    console.log(username, a);
                    if (a) {
                        a.classList.add("be-fe-group-admin");
                        a.appendChild(h(".be-fe-group-admin--crown", {title: "Administrator"}));
                    }
                });
        });
};
