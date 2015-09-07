import userId from "./utils/current-user-id.js";

function start() {
    require('../less/main.less');

    var settingsStore = require("./settings-store");

    var actions = [
        require("./actions/settings-link"),
        require("./actions/comments-common"),
        require("./actions/iam-common")
    ];

    settingsStore.init();
    settingsStore.loadSettings()
        .then(function (settings) {
            for (var k in settings) {
                if (settings.hasOwnProperty(k) && settings[k] === true) {
                    actions.push(require("./actions/" + k));
                }
            }
            var observer = new MutationObserver(function (mutations) {
                mutations.forEach(function (mutation) {
                    var i, l, node;
                    for (i = 0, l = mutation.addedNodes.length; i < l; i++) {
                        node = mutation.addedNodes[i];
                        if (node.nodeType == Node.ELEMENT_NODE) {
                            actions.forEach(function (act) { act(node, settings); });
                        }
                    }
                });
            });

            actions.forEach(function (act) { act(undefined, settings); });
            observer.observe(document.body, {childList: true, subtree: true});
        });
}

if (!/^\/(attachments|files)\//.test(location.pathname)) {

    if (!MutationObserver || !Promise) {
        console.error("Can not start BetterFeed: MutationObserver & Promise not supported");
    } else if (userId === null) {
        console.error("Can not start BetterFeed: user not logged in");
    } else if (!("__BetterFeed" in window)) {
        window.__BetterFeed = {};
        start();
    }

}
