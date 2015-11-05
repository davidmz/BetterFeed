import forSelect from "../utils/for-select.js";
import closestParent from "../utils/closest-parent.js";
import IAm from "../utils/i-am.js";

var myLogin = null;

export default function (node) {
    node = node || document.body;

    if (!myLogin) {
        var loggedLink = node.querySelector(".logged-user .author a");
        if (loggedLink) {
            myLogin = loggedLink.getAttribute("href").substr(1);
        }
    }

    forSelect(node, ".comment:not(.be-fe-comment-from)", async (node) => {
        var postBody = closestParent(node, ".post-body");
        if (!postBody) return;

        var postAuthor = postBody.querySelector(".title a").getAttribute("href").substr(1);
        var authorLink = node.querySelector(".author a");
        if (!authorLink) {
            if (node.classList.contains("p-timeline-comment")) {
                node.classList.add("be-fe-comment-from");
                node.classList.add("be-fe-comment-from-me");
            }
            return;
        }
        var author = authorLink.getAttribute("href").substr(1);
        if (author == postAuthor) {
            node.classList.add("be-fe-comment-from-post-author");
        }
        node.classList.add("be-fe-comment-from");
        node.classList.add("be-fe-comment-from-u-" + author);
        node.dataset["author"] = author;

        var type = (await IAm.ready).whoIs(author);
        if (type & IAm.ME) {
            node.classList.add("be-fe-comment-from-me");
        } else if (type & IAm.FRIEND) {
            node.classList.add("be-fe-comment-from-friend");
        } else if (type & IAm.READER) {
            node.classList.add("be-fe-comment-from-reader");
        }
    });
}

