var docLoaded = require("./utils/doc-loaded");
var h = require("./utils/html");

var actions = [];

if (MutationObserver && Promise) {
    docLoaded.then(function () {
        var observer = new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
                var i, l, node;
                for (i = 0, l = mutation.addedNodes.length; i < l; i++) {
                    node = mutation.addedNodes[i];
                    if (node.nodeType == Node.ELEMENT_NODE) {
                        actions.forEach(function (act) { act(node); });
                    }
                }
            });
        });
        observer.observe(document.body, {childList: true, subtree: true});
        actions.forEach(function (act) { act(); });

        if (localStorage["be-fe-enabled"] === "1") {
            var e = document.createElement("script");
            e.src = 'https://cdn.rawgit.com/davidmz/BetterFeed/v1.13.0/build/better-feed.user.js';
            e.type = "text/javascript";
            e.charset = "utf-8";
            e.async = true;
            document.head.appendChild(e);
        }
    });
}

actions.push(function (node) {
    node = node || document.body;
    var chPassHead = node.querySelector(".p-settings-changepassword-header");
    if (!chPassHead || node.querySelector(".p-settings-betterfeed-header")) {
        return;
    }

    var check = null,
        button = null;

    var html = h("div",
        h("h2.p-settings-betterfeed-header", "Add-ons"),
        h("p", h("label", check = h("input", {type: "checkbox"}), " Enable BetterFeed")),
        h("p",
            "BetterFeed is an add-on that improves or dramatically alters stock interface of FreeFeed (",
            h("a", {href: "https://github.com/davidmz/BetterFeed", target: "_blank"}, "details"),
            "). ",
            h("br"),
            h("strong", "Important:"),
            " BetterFeed settings are stored in your local browser. They are not tied to FreeFeed account and are not automatically synced between sessions in different browsers."
        ),
        h("p", button = h("button.btn.btn-default", "Apply")),
        h("hr")
    );

    chPassHead.parentNode.insertBefore(html, chPassHead);

    check.checked = (localStorage["be-fe-enabled"] === "1");

    button.addEventListener("click", function () {
        localStorage["be-fe-enabled"] = check.checked ? "1" : "";
        location.reload();
    });

});
