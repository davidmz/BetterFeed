import forSelect from "../utils/for-select.js";
import closestParent from "../utils/closest-parent.js";
require("../../less/hide-next-comments.less");

export default function (node) {
    node = node || document.body;

    var c;
    if (node.querySelector(".comments")) {
        forSelect(node, ".comments", processComments);
    } else if ((c = node.querySelector(".p-comment")) !== null) {
        processComments(closestParent(c, ".comments"));
    }
};

function processComments(comments) {
    if (!comments) return;
    var prevAuthor = "",
        prevTime = 0,
        child = comments.firstElementChild,
        comment, author, time;

    while (child) {
        if (child.classList.contains("ember-view")) {
            comment = child.querySelector(".p-comment");
            author = comment.dataset["author"] || comment.querySelector(".author > a").getAttribute("href").substr(1);
            time = Date.parse(comment.querySelector("time").getAttribute("datetime"));
            if (author !== prevAuthor) {
                prevAuthor = author;
            } else if (time < prevTime + 900 * 1000) {
                comment.classList.add("be-fe-next-comment");
            }
            prevTime = time;
        } else if (child.classList.contains("more-comments-wrapper")) {
            prevAuthor = "";
            prevTime = 0;
        } else {
            break;
        }
        child = child.nextElementSibling;
    }
}