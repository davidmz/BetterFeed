var forSelect = require("../utils/for-select");

var fixSize = function (ta) {
    if (ta.scrollHeight > ta.clientHeight && ta.scrollHeight < 150) {
        ta.style.height = (ta.scrollHeight + 3) + "px";
    }
};

module.exports = function (node) {
    if (node === undefined) {
        document.addEventListener("input", function (e) {
            if (e.target.tagName == "TEXTAREA" && e.target.classList.contains("ember-text-area")) {
                fixSize(e.target);
            }
        });
        document.addEventListener("keyup", function (e) {
            if (e.target.tagName == "TEXTAREA" && e.target.classList.contains("ember-text-area")) {
                fixSize(e.target);
            }
        });
    }

    node = node || document.body;

    forSelect(node, "textarea", fixSize);
};

