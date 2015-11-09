import forSelect from "../utils/for-select";
import escapeHTML from "../utils/escape-html";
import h from "../utils/html";

var myLogin = null;

/**
 *
 * @param {HTMLElement|null} node
 * @param {Settings} settings
 */
export default function (node, settings) {
    node = node || document.body;

    // показывать только логины (иначе скриннеймы и логины в скобках)
    var showLoginOnly = settings.flag("fix-names");

    if (!myLogin) {
        var loggedLink = node.querySelector(".logged-user .author a");
        if (loggedLink) {
            myLogin = loginFromPath(loggedLink.getAttribute("href"));
        }
    }

    forSelect(node, ".post-body > .title a:not(.be-fe-nameFixed), .p-comment-body .author a:not(.be-fe-nameFixed), .p-timeline-user-like > a:not(.be-fe-nameFixed)", node => {
        if (!node.hasAttribute("href")) return;
        node.classList.add("be-fe-nameFixed");
        var login = loginFromPath(node.getAttribute("href"));
        var name = node.textContent;
        var h;
        if (showLoginOnly) {
            h = escapeHTML(login);
        } else {
            h = escapeHTML(name);
            if (login !== name && !(login === myLogin && !settings.flag("not-you"))) {
                h += ` <span class="be-fe-username">(${escapeHTML(login)})</span>`;
            }
        }
        node.innerHTML = h;
        if (!settings.flag("user-info") && showLoginOnly) {
            node.setAttribute("title", name);
        }
    });

    // особый случай: списки подписчиков/подписанных
    forSelect(node, ".p-timeline-subscription-user, .p-timeline-sunsctiption-group, .p-user-subscriber", node => {
        forSelect(node, "a[href]:not(.be-fe-nameFixed)", (node) => {
            node.classList.add("be-fe-nameFixed");
            var login = loginFromPath(node.getAttribute("href"));
            var name = "";
            var c = node.firstChild;
            while (c) {
                if (c.nodeType == Node.TEXT_NODE) {
                    name = c.nodeValue.replace(/^\s*|\s*$/, "");
                    if (name !== "") {
                        if (showLoginOnly) {
                            c.nodeValue = login;
                        } else if (login != name) {
                            c.parentNode.insertBefore(h("$", " ", h("span.be-fe-username", "(", login, ")")), c.nextSibling);
                        }
                        break;
                    }
                }
                c = c.nextSibling;
            }
            if (name !== "" && !settings.flag("user-info") && showLoginOnly) {
                node.setAttribute("title", name);
            }
        });
    });

};

function loginFromPath(path) {
    let m = /^\/([a-z0-9]+(?:-[a-z0-9]+)*)/.exec(path);
    return m ? m[1] : "";
}