var forSelect = require("../utils/for-select");
require('../../less/comment-counters.less');

module.exports = function (node) {
    node = node || document.body;

    forSelect(node, ".more-comments", function (node) {
        var n = parseInt(node.textContent);
        if (!isNaN(n)) {
            node.style.counterIncrement = "comments " + n;
        }
    });
};
