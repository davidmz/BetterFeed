import forSelect from "../utils/for-select.js";
require('../../less/comment-counters.less');

export default function (node) {
    node = node || document.body;

    forSelect(node, ".more-comments", function (node) {
        var n = parseInt(node.textContent);
        if (!isNaN(n)) {
            node.style.counterIncrement = "comments " + n;
        }
    });
};
