require('../less/main.less');

var settingsStore = require("./settings-store");

var actions = [
    require("./actions/settings-link")
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
                        actions.forEach(function (act) { act(node); });
                    }
                }
            });
        });

        actions.forEach(function (act) { act(); });
        observer.observe(document.body, {childList: true, subtree: true});
    });