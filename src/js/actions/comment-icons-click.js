var closestParent = require("../utils/closest-parent");

module.exports = function (node) {
    if (node === undefined) {
        document.body.addEventListener("click", quoteEventHandler, false);
    }
};

var quoteEventHandler = function (e) {
    if (!e.target.matches(".comment .date") && !e.target.parentNode.matches(".comment .date") || e.button != 0) return;
    e.preventDefault();
    var caps = null;

    if (e.metaKey || e.ctrlKey) {
        var p = closestParent(e.target, ".ember-view");
        var n = 1;
        p = p.nextElementSibling;
        while (p) {
            if (p.classList.contains("ember-view")) n++;
            p = p.nextElementSibling;
        }
        caps = new Array(n + 1).join("^");
    }

    var login = closestParent(e.target, ".comment").dataset["author"];
    var body = closestParent(e.target, ".post-body");
    var ta = body.querySelector("textarea");
    if (!ta) {
        var comLink = body.querySelector(".p-timeline-post-comment-action");
        if (comLink) {
            comLink.click();
            ta = body.querySelector("textarea");
        }
    }
    if (ta) {
        if (caps) {
            ta.value += caps + " " + (e.shiftKey ? "this" : "");
        } else if (login) {
            ta.value += "@" + login + " ";
        }
        ta.focus();
        ta.selectionStart = ta.selectionEnd = ta.value.length;
    }
};
