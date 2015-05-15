var isArray = require("./is-array");

module.exports = {
    get: function () {
        var banList;
        try {
            banList = JSON.parse(localStorage["be-fe.banList"]);
        } catch (e) {
            banList = [];
        }
        if (!isArray(banList)) banList = [];
        return banList;
    },

    set: function (list) {
        localStorage["be-fe.banList"] = JSON.stringify(list);
    },

    add: function (user) {
        var list = this.get();
        if (list.indexOf(user) === -1) list.push(user);
        this.set(list);
    }
};
