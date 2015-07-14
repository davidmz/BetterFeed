var forSelect = require("../utils/for-select");

module.exports = function (node, settings) {
    node = node || document.body;

    forSelect(node, ".post-body > .title a:not(.be-fe-nameFixed), .p-comment-body .author a:not(.be-fe-nameFixed), .p-timeline-user-like > a:not(.be-fe-nameFixed)", (node) => {
        if (!node.hasAttribute("href")) return;
        node.classList.add("be-fe-nameFixed");
        var login = node.getAttribute("href").substr(1);
        var name = node.innerHTML;
        node.innerHTML = login;
        if (!settings["user-info"]) {
            node.setAttribute("title", name);
        }
    });

    // особый случай: списки подписчиков/подписанных
    forSelect(node, ".p-timeline-subscription-user, .p-timeline-sunsctiption-group, .p-user-subscriber", (node) => {
        forSelect(node, "a[href]:not(.be-fe-nameFixed)", (node) => {
            node.classList.add("be-fe-nameFixed");
            var login = node.getAttribute("href").substr(1);
            var name = "";
            var c = node.firstChild;
            while (c) {
                if (c.nodeType == Node.TEXT_NODE) {
                    name = c.nodeValue.replace(/^\s*|\s*$/, "");
                    if (name !== "") {
                        c.nodeValue = login;
                        break;
                    }
                }
                c = c.nextSibling;
            }
            if (name !== "" && !settings["user-info"]) {
                node.setAttribute("title", name);
            }
        });
    });

};