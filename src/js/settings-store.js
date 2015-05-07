var getSettings = function (toApply) {
    var settingsNames = [
        "fix-names",
        "fold-comments",
        "lightboxed-images",
        "bottom-comment-link",
        "colored-comment-icons",
        "at-links"
    ];
    toApply = toApply || {};
    var settings = {};
    settingsNames.forEach(function (name) {
        settings[name] = (name in toApply) ? toApply[name] : true;
    });
    return settings;
};


var settingsStoreZero = {
    init: function () {},
    loadSettings: function () { return new Promise(function (resolve) { setTimeout(function () { resolve(getSettings()); }, 0); }); },
    saveSettings: function (settings) { return new Promise(function (resolve) { setTimeout(resolve, 0); }); }
};


var settingsStorePage = {
    init: function () {
        var self = this;
        // мы во внедрённом скрипте
        window.addEventListener('message', function (event) {
            if ("action" in event.data && event.data["action"] === "getSettings") {
                self.loadSettings().then(function (settings) {
                    event.source.postMessage(settings, event.origin);
                });
            }
            if ("action" in event.data && event.data["action"] === "saveSettings") {
                self.saveSettings(event.data["value"]);
            }
            if ("action" in event.data && event.data["action"] === "checkUpdates") {
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
                                alert("Доступна новая версия: " + newVersion + ". Она будет установлена после перезагрузки страницы.");
                            } else {
                                alert("У вас установлена последняя версия");
                            }
                        }
                    } catch (e) {
                    }
                };
                xhr.send();
            }
        });
    },

    loadSettings: function () {
        return new Promise(function (resolve) {
            var settings;
            try {
                settings = getSettings(JSON.parse(localStorage['ffc-sac-settings']));
            } catch (e) {
                settings = getSettings();
            }
            resolve(settings);
        });
    },

    saveSettings: function (settings) {
        localStorage['ffc-sac-settings'] = JSON.stringify(settings);
        return new Promise(function (resolve) { setTimeout(resolve, 0); });
    }
};

var settingsStoreFrame = {
    init: function () {
        var self = this;
        this.loadResolver = null;
        this.parentOrigin = "https://freefeed.net";
        window.addEventListener('message', function (event) {
            if (event.origin === self.parentOrigin && self.loadResolver !== null) {
                self.loadResolver(getSettings(event.data));
                self.loadResolver = null;
            }
        });
    },

    loadSettings: function () {
        var self = this;
        return new Promise(function (resolve) {
            self.loadResolver = resolve;
            window.parent.postMessage({action: "getSettings", value: null}, self.parentOrigin);
        });
    },

    saveSettings: function (settings) {
        var self = this;
        return new Promise(function (resolve) {
            window.parent.postMessage({action: "saveSettings", value: settings}, self.parentOrigin);
            setTimeout(resolve, 0);
        });
    }
};

if (location.hostname === "freefeed.net") { // Встроенный скрипт
    module.exports = settingsStorePage;

} else if (window.parent) { // Фрейм настроек
    module.exports = settingsStoreFrame;

} else { // Непонятно что
    module.exports = settingsStoreZero;

}
