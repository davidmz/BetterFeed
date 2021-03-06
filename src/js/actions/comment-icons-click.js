import closestParent from "../utils/closest-parent";
import matches from "../utils/matches.js";

export default function (node) {
    if (node === undefined) {
        document.body.addEventListener("click", quoteEventHandler, false);
    }
}

var quoteEventHandler = function (e) {
    if (!matches(e.target, ".comment .date") && !(e.target.parentNode && matches(e.target.parentNode, ".comment .date")) || e.button != 0) return;
    e.preventDefault();
    var caps = null;

    if (e.metaKey || e.ctrlKey) {
        var p = closestParent(e.target, ".ember-view");
        var n = 1, m;
        p = p.nextElementSibling;
        while (p) {
            if (p.classList.contains("ember-view")) {
                n++;
            } else if (p.classList.contains("more-comments")) {
                m = parseInt(p.textContent);
                if (!isNaN(m)) {
                    n += m;
                }
            } else if (p.classList.contains("more-comments-wrapper")) {
                m = parseInt(p.firstElementChild.textContent);
                if (!isNaN(m)) {
                    n += m;
                }
            }
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
        $(ta).change();
    }
};
