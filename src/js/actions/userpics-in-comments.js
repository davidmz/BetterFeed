require('../../less/userpics-in-comments.less');
var forSelect = require("../utils/for-select");
var uPics = require("../utils/userpics");

var myLogin = null;

module.exports = function (node, settings) {
    if (!node && settings["colored-comment-icons"]) {
        require('../../less/colored-userpics-in-comments.less');
    }

    node = node || document.body;

    if (!myLogin) {
        var loggedLink = node.querySelector(".logged-user .author a");
        if (loggedLink) {
            myLogin = loggedLink.getAttribute("href").substr(1);
        }
    }

    forSelect(node, ".comment a.date:not(.be-fe-with-pic)", function (node) {
        node.classList.add("be-fe-with-pic");
        var comment = node.parentNode;
        var username = comment.dataset["author"];
        if (!username) {
            if (comment.matches(".p-timeline-comment") && myLogin) {
                username = myLogin;
                comment.classList.add("be-fe-comment-from-me");
            } else {
                return;
            }
        }
        var img = node.appendChild(new Image());
        img.className = "be-fe-userpic";
        uPics.getPic(username).then(function (picUrl) { img.src = picUrl; });
    });
};
