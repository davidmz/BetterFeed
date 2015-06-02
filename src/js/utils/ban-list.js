var isArray = require("./is-array");

var BanList = function (name) {
    this.name = name;
};

BanList.prototype.get = function () {
    var list;
    try {
        list = JSON.parse(localStorage[this.name]);
    } catch (e) {
        list = [];
    }
    if (!isArray(list)) list = [];
    return list;
};

BanList.prototype.set = function (list) {
    localStorage[this.name] = JSON.stringify(list);
};

BanList.prototype.add = function (user) {
    var list = this.get();
    if (list.indexOf(user) === -1) list.push(user);
    this.set(list);
};

BanList.prototype.remove = function (user) {
    var list = this.get();
    var p = list.indexOf(user);
    if (p !== -1) list.splice(p, 1);
    this.set(list);
};

BanList.prototype.contains = function (user) {
    return (this.get().indexOf(user) !== -1);
};

module.exports = BanList;