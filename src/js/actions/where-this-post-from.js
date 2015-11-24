import IAm from "../utils/i-am.js";
import * as api from "../utils/api.js";
import forSelect from "../utils/for-select.js";
import h from "../utils/html.js";

/**
 *
 * @param {HTMLElement|null} node
 * @param {Settings} settings
 */
export default function (node, settings) {
    // включаемся только на френдленте
    if (location.pathname !== "/") return;

    node = node || document.body;

    var useScreenNames = !settings.flag("fix-names");
    var useScreenNamesAndLogins = (useScreenNames && settings.flag("show-usernames"));

    forSelect(node, ".timeline-post-container:not(.be-fe-where-from)", async (node) => {
        node.classList.add("be-fe-where-from");

        // автор поста
        var authorLink = node.querySelector(".title a.post-author");
        if (!authorLink) return;

        var postAuthor = authorLink.getAttribute("href").substr(1);
        node.classList.add("be-fe-post-from-u-" + postAuthor);

        var postId = node.dataset.postId;
        if (!postId) return; // удивительный случай, когда у поста нет ID в HTML

        var postTargets = [];
        forSelect(node, ".title a", a => {
            var u = a.getAttribute("href").substr(1);
            if (u !== postAuthor) {
                postTargets.push(u);
                node.classList.add("be-fe-post-from-u-" + u);
            }
        });

        node.dataset["postAuthor"] = postAuthor;

        var iAm = await IAm.ready;

        if (iAm.whoIs(postAuthor) & (IAm.ME | IAm.FRIEND)) return;

        // пост в мои группы?
        if (postTargets.some(function (u) { return !!(iAm.whoIs(u) & IAm.FRIEND); })) {
            return;
        }

        node.classList.add("be-fe-post-from-alien");

        // пытаемся выяснить, почему мы это видим
        var postInfo = await api.get('/v1/posts/' + postId + '?maxLikes=all');
        var names = {};
        var users = postInfo.users
            .map(uu => {
                names[uu.username] = useScreenNames ? uu.screenName : uu.username;
                return uu.username;
            })
            .filter(u => !!(iAm.whoIs(u) & (IAm.ME | IAm.FRIEND)))
            .filter((v, i, a) => a.indexOf(v) === i) // http://stackoverflow.com/questions/1960473/unique-values-in-an-array#answer-14438954
            ;

        if (users.length > 0) {
            var links = [];
            if (users.length < 5) {
                // просто показываем всех
                users.forEach((u, i) => {
                    if (i > 0) {
                        if (i == users.length - 1) {
                            links.push(" and ");
                        } else {
                            links.push(", ");
                        }
                    }
                    let ht = [names[u]];
                    if (useScreenNamesAndLogins && names[u] !== u) {
                        ht.push(h("$", " ", h("span.be-fe-username", "(", u, ")")))
                    }
                    links.push(h("a.be-fe-nameFixed", {href: "/" + u}, ht));
                });
            } else {
                users.slice(0, 3).forEach((u, i) => {
                    if (i > 0) {
                        links.push(", ");
                    }
                    let ht = [names[u]];
                    if (useScreenNamesAndLogins && names[u] !== u) {
                        ht.push(h("$", " ", h("span.be-fe-username", "(", u, ")")))
                    }
                    links.push(h("a.be-fe-nameFixed", {href: "/" + u}, ht));
                });
                links.push(" and " + (users.length - 3) + " other");
            }

            node.querySelector(".title > div").appendChild(h("span.be-fe-from-whom", " via ", links));
        } else {
            node.querySelector(".title > div").appendChild(h("span.be-fe-from-whom", " via somebody"));
        }

    });
};

