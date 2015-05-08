var getSettings = function (toApply) {
    var settingsNames = [
        "fix-names",
        "fold-comments",
        "lightboxed-images",
        "bottom-comment-link",
        "colored-comment-icons",
        "at-links",
        "comment-icons-click",
        "animated-gif"
    ];
    toApply = toApply || {};
    var settings = {};
    settingsNames.forEach(function (name) {
        settings[name] = (name in toApply) ? toApply[name] : true;
    });
    return settings;
};

var settingsStore = {
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

var docLoaded = new Promise(function (resolve) {
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        setTimeout(resolve, 0);
    } else {
        document.addEventListener("DOMContentLoaded", resolve);
    }
});

////////////////////////////

docLoaded.then(function () {
    var version = location.pathname.match(/BetterFeed\/([^\/]+)/)[1];
    document.querySelector(".version").appendChild(document.createTextNode(version));

    var sPage = document.querySelector(".content.settings");
    var checkBoxes = Array.prototype.slice.call(sPage.querySelectorAll("input[type='checkbox']"));

    settingsStore.init();
    settingsStore.loadSettings().then(function (settings) {
        checkBoxes.forEach(function (box) {
            box.checked = settings[box.value];
        });
        sPage.classList.remove("hidden");
        sPage.previousElementSibling.classList.add("hidden");
    });

    document.getElementById("save-settings").addEventListener("click", function (e) {
        var saveBtn = e.target;
        saveBtn.disabled = true;
        var settings = {};
        checkBoxes.forEach(function (box) { settings[box.value] = box.checked; });
        settingsStore.saveSettings(settings).then(function () { saveBtn.disabled = false; });
    }, false);

    var refreshBtn = document.getElementById("check-updates");
    refreshBtn.classList.remove("hidden");
    refreshBtn.addEventListener("click", function () {
        refreshBtn.disabled = true;
        window.parent.postMessage({action: "checkUpdates", value: null}, "https://freefeed.net");
    }, false);
});


