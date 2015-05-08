var closestParent = require("../utils/closest-parent");

module.exports = function (node) {
    if (node === undefined) {

        document.addEventListener("keydown", function (e) {
            if (e.keyCode === 13 && e.target.tagName == "TEXTAREA" && e.target.classList.contains("ember-text-area")) {
                e.stopPropagation();
                e.preventDefault();
            }
        }, true);

        document.addEventListener("keyup", function (e) {
            if (e.keyCode === 13 && e.target.tagName == "TEXTAREA" && e.target.classList.contains("ember-text-area")) {
                e.stopPropagation();
                e.preventDefault();
                if (e.target.value !== "") {
                    var form = closestParent(e.target, ".edit, .create-post");
                    if (form) {
                        var btn = form.querySelector("button");
                        if (btn) {
                            btn.click();
                            e.target.style.height = "26px";
                        }
                    }
                }
            }
        }, true);

        document.addEventListener("input", function (e) {
            if (e.target.tagName == "TEXTAREA" && e.target.classList.contains("ember-text-area")) {
                if (e.target.scrollHeight > e.target.clientHeight && e.target.scrollHeight < 150) {
                    e.target.style.height = (e.target.scrollHeight + 3) + "px";
                }
            }
        });
    }
};

