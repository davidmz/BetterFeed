var forSelect = require("../utils/for-select");
var IAm = require("../utils/i-am");

module.exports = function (node) {
    node = node || document.body;
    forSelect(node, ".p-settings-alert", () => IAm.update());
};

