require('../../less/userpics-in-comments.less');
import forSelect from "../utils/for-select";
import uPics from "../utils/userpics";
import matches from "../utils/matches.js";

var myLogin = null;

/**
 *
 * @param {HTMLElement|null} node
 * @param {Settings} settings
 */
export default function (node, settings) {
    if (!node && settings.flag("colored-comment-icons")) {
        require('../../less/colored-userpics-in-comments.less');
    }

    node = node || document.body;

    if (!myLogin) {
        var loggedLink = node.querySelector(".logged-user .author a");
        if (loggedLink) {
            myLogin = loggedLink.getAttribute("href").substr(1);
        }
    }

    forSelect(node, ".comment a.date:not(.be-fe-with-pic)", node => {
        node.classList.add("be-fe-with-pic");
        var comment = node.parentNode;
        var username = comment.dataset["author"];
        if (!username) {
            if (matches(comment, ".p-timeline-comment") && myLogin) {
                username = myLogin;
                comment.classList.add("be-fe-comment-from-me");
                comment.classList.add("be-fe-comment-from");
            } else {
                return;
            }
        }
        var img = node.appendChild(new Image());
        img.className = "be-fe-userpic";
        uPics.getPic(username).then(picUrl => img.src = picUrl);
    });
};
