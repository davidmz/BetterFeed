require('../../less/comments-icons.less');

var forSelect = require("../utils/for-select");
var h = require("../utils/html");

module.exports = function (node) {
    node = node || document.body;

    forSelect(node, ".comment .date:not(.be-fe-iconized)", function (node) {
        node.classList.add("be-fe-iconized");
        node.appendChild(h("i.fa.fa-comment.icon.be-fe-ico-bg"));
    });
};

