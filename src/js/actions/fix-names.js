var forSelect = require("../utils/for-select");

module.exports = function (node) {
    node = node || document.body;

    forSelect(node, ".post-body > .title a:not(.be-fe-nameFixed), .p-comment-body .author a:not(.be-fe-nameFixed), .p-timeline-user-like > a:not(.be-fe-nameFixed)", function (node) {
        var login = node.getAttribute("href").substr(1);
        var name = node.innerHTML;
        node.innerHTML = login;
        node.setAttribute("title", name);
        node.classList.add("be-fe-nameFixed");
    });
};