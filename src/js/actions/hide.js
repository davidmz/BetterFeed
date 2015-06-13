var IAm = require("../utils/i-am");
var hideTools = require("../utils/hide-tools");
var forSelect = require("../utils/for-select");
var h = require("../utils/html");
var closestParent = require("../utils/closest-parent");

module.exports = function (node, settings) {
    if (!settings["where-this-post-from"]) return;

    node = node || document.body;

    hideTools.commsBanList.get().forEach(function (user) {
        forSelect(node, ".be-fe-comment-from-u-" + user + ":not(.be-fe-comment-hidden)", function (node) {
            node.classList.add("be-fe-comment-hidden");
        });
    });
};