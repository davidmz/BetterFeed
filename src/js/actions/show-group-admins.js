var forSelect = require("../utils/for-select");
var api = require("../utils/api");

module.exports = function (node, settings) {
    node = node || document.body;

    if (!node.querySelector("h3.p-user-subscribers")) return;

    var username = location.pathname.split("/")[1];

    api.get(`/v1/users/${username}`).then((resp) => {
        var inf = resp[0].users;
        if (!inf.id || inf.type !== "group") return;

        var adminIds = inf.administratorIds;
    });
};
