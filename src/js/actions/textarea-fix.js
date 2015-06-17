var forSelect = require("../utils/for-select");

module.exports = function (node) {
    if (node === undefined) {
        document.addEventListener("input", function (e) {
            if (e.target.tagName == "TEXTAREA" && e.target.classList.contains("ember-text-area")) {
                if (e.target.scrollHeight > e.target.clientHeight && e.target.scrollHeight < 150) {
                    e.target.style.height = (e.target.scrollHeight + 3) + "px";
                }
            }
        });
    }

    node = node || document.body;

    forSelect(node, "textarea", function (node) {
        if (node.scrollHeight > node.clientHeight && node.scrollHeight < 150) {
            node.style.height = (node.scrollHeight + 3) + "px";
        }
    });
};

