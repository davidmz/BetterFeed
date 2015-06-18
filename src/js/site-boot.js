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
        h("h2.p-settings-betterfeed-header", "Дополнения"),
        h("p", h("label", check = h("input", {type: "checkbox"}), " BetterFeed")),
        h("p",
            "BetterFeed \u2014 это дополнение, улучшающее интерфейс FreeFeed-а (",
            h("a", {href: "https://github.com/davidmz/BetterFeed", target: "_blank"}, "подробнее"),
            "). ",
            h("br"),
            h("strong", "Важно:"),
            " настройки BetterFeed хранятся в вашем браузере. Они не привязаны к FreeFeed-аккаунту и не переносятся автоматически между разными браузерами."
        ),
        h("p", button = h("button.btn.btn-default", "Применить")),
        h("hr")
    );

    chPassHead.parentNode.insertBefore(html, chPassHead);

    check.checked = (localStorage["be-fe-enabled"] === "1");

    button.addEventListener("click", function () {
        localStorage["be-fe-enabled"] = check.checked ? "1" : "";
        location.reload();
    });

});
