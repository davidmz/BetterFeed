import { userId } from "./utils/current-user-id.js";
import Settings, { flagNames } from "./settings.js";
import Messenger from "./utils/message-rpc.js";

function start() {
    require('../less/main.less');

    const
        settings = new Settings(userId),
        msg = new Messenger();

    msg.on("getSettings", () => settings);
    msg.on("saveSettings", v => {
        var s = new Settings(undefined, v);
        s.save();
    });
    msg.on("checkUpdates", checkUpdates);

    var actions = [
        require("./actions/settings-link"),
        require("./actions/posts-common"),
        require("./actions/comments-common"),
        require("./actions/iam-common")
    ];

    flagNames.forEach(name => {
        if (settings.flag(name)) {
            actions.push(require("./actions/" + name));
        }
    });

    var observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            var i, l, node;
            for (i = 0, l = mutation.addedNodes.length; i < l; i++) {
                node = mutation.addedNodes[i];
                if (node.nodeType == Node.ELEMENT_NODE) {
                    actions.forEach(callWith(node, settings));
                }
            }
        });
    });

    actions.forEach(callWith(undefined, settings));
    observer.observe(document.body, {childList: true, subtree: true});
}

if (!/^\/(attachments|files)\//.test(location.pathname)) {

    if (!MutationObserver || !Promise) {
        console.error("Can not start BetterFeed: MutationObserver & Promise not supported");
    } else if (userId === null) {
        console.error("Can not start BetterFeed: user not logged in");
    } else if ("__BetterFeed" in window) {
        console.warn("BetterFeed already started");
    } else {
        window.__BetterFeed = {};
        start();
    }

}

function callWith(...args) {
    return (f) => f(...args);
}

function checkUpdates() {
    var now = Date.now();
    var oldVersion = localStorage['be-fe-version'];
    localStorage['be-fe-next-update'] = now + 3600 * 1000;
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'https://api.github.com/repos/davidmz/BetterFeed/tags?page=1&&per_page=1');
    xhr.responseType = "json";
    xhr.onload = function () {
        try {
            var tags = this.response;
            if (tags.length == 1 && "name" in tags[0]) {
                var newVersion = tags[0]["name"];
                localStorage['be-fe-version'] = newVersion;
                localStorage['be-fe-next-update'] = now + 24 * 3600 * 1000;
                if (newVersion != oldVersion) {
                    alert(`Доступна новая версия: ${newVersion}. Она будет установлена после перезагрузки страницы.`);
                } else {
                    alert(`У вас установлена последняя версия (${newVersion})`);
                }
            }
        } catch (e) {
        }
    };
    xhr.send();
}