var IAm = require("../utils/i-am");
var forSelect = require("../utils/for-select");
var h = require("../utils/html");

module.exports = function (node, settings) {
    node = node || document.body;

    var useScreenNames = !settings["fix-names"];

    // включаемся только на френдленте
    if (location.pathname !== "/") return;

    forSelect(node, ".timeline-post-container:not(.be-fe-where-from)", function (node) {
        node.classList.add("be-fe-where-from");

        // автор поста
        var authorLink = node.querySelector(":scope > .avatar > a");
        if (!authorLink) return;

        var postAuthor = authorLink.getAttribute("href").substr(1);
        var postId = node.querySelector("a.datetime").getAttribute("href").match(/^\/.+?\/([\w-]+)/)[1];

        IAm.ready.then(function (iAm) {
            var aType = iAm.whoIs(postAuthor);
            if (aType === IAm.ME || aType === IAm.FRIEND) return;

            // пытаемся выяснить, почему мы это видим
            getPostInfo(postId).then(function (postInfo) {
                var users = postInfo.users
                        .map(function (uu) { return [uu.username, useScreenNames ? uu.screenName : uu.username]; })
                        .filter(function (u) {
                            var type = iAm.whoIs(u[0]);
                            return (type === IAm.ME || type === IAm.FRIEND);
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
                            links.push(h("a.be-fe-nameFixed", {href: "/" + u[0]}, u[1]));
                        });
                    } else {
                        users.slice(0, 3).forEach(function (u, i) {
                            if (i > 0) {
                                links.push(", ");
                            }
                            links.push(h("a.be-fe-nameFixed", {href: "/" + u[0]}, u[1]));
                        });
                        links.push(" and " + (users.length - 3) + " other");
                    }

                    node.querySelector(".title > div").appendChild(h("span.be-fe-from-whom", " (from ", links, ")"));
                }
            });
        });
    });
};


function getPostInfo(postId) {
    return new Promise(function (resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', '/v1/posts/' + postId);
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