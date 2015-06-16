var IAm = require("../utils/i-am");
var api = require("../utils/api");
var forSelect = require("../utils/for-select");
var h = require("../utils/html");

module.exports = function (node, settings) {
    // включаемся только на френдленте
    if (location.pathname !== "/") return;

    node = node || document.body;

    var useScreenNames = !settings["fix-names"];

    forSelect(node, ".timeline-post-container:not(.be-fe-where-from)", function (node) {
        node.classList.add("be-fe-where-from");

        // автор поста
        var authorLink = node.querySelector(":scope > .avatar > a");
        if (!authorLink) return;

        var postAuthor = authorLink.getAttribute("href").substr(1);
        var pp = node.querySelector("a.datetime").getAttribute("href").match(/^\/.+?\/([\w-]+)/);
        if (!pp) return; // удивительный случай, когда у поста нет ID в HTML
        var postId = pp[1];

        var postTargets = [];
        forSelect(node, ".title a", function (node) {
            var u = node.getAttribute("href").substr(1);
            if (u !== postAuthor) {
                postTargets.push(u);
            }
        });

        node.classList.add("be-fe-post-from-u-" + postAuthor);
        node.dataset["postAuthor"] = postAuthor;

        IAm.ready.then(function (iAm) {
            if (iAm.whoIs(postAuthor) & (IAm.ME | IAm.FRIEND)) return;

            // пост в мои группы?
            if (postTargets.some(function (u) { return !!(iAm.whoIs(u) & IAm.FRIEND); })) {
                return;
            }

            node.classList.add("be-fe-post-from-alien");

            // пытаемся выяснить, почему мы это видим
            api.get('/v1/posts/' + postId + '?maxLikes=all').then(function (postInfo) {
                var names = {};
                var users = postInfo.users
                        .map(function (uu) {
                            names[uu.username] = useScreenNames ? uu.screenName : uu.username;
                            return uu.username;
                        })
                        .filter(function (u) {
                            return !!(iAm.whoIs(u) & (IAm.ME | IAm.FRIEND));
                        })
                        .filter(function (v, i, a) { return a.indexOf(v) === i;}) // http://stackoverflow.com/questions/1960473/unique-values-in-an-array#answer-14438954
                    ;

                if (users.length > 0) {
                    var links = [];
                    if (users.length < 5) {
                        // просто показываем всех
                        users.forEach(function (u, i) {
                            if (i > 0) {
                                if (i == users.length - 1) {
                                    links.push(" and ");
                                } else {
                                    links.push(", ");
                                }
                            }
                            links.push(h("a.be-fe-nameFixed", {href: "/" + u}, names[u]));
                        });
                    } else {
                        users.slice(0, 3).forEach(function (u, i) {
                            if (i > 0) {
                                links.push(", ");
                            }
                            links.push(h("a.be-fe-nameFixed", {href: "/" + u}, names[u]));
                        });
                        links.push(" and " + (users.length - 3) + " other");
                    }

                    node.querySelector(".title > div").appendChild(h("span.be-fe-from-whom", " (via ", links, ")"));
                }
            });
        });
    });
};


function getPostInfo(postId) {
    return new Promise(function (resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', '/v1/posts/' + postId + '?maxLikes=all');
        xhr.responseType = 'json';
        xhr.setRequestHeader('X-Authentication-Token', localStorage["authToken"]);
        xhr.onload = function () {
            if ("err" in xhr.response) {
                reject(xhr.response.err);
                return;
            }
            resolve(xhr.response);
        };
        xhr.send();
    });
}