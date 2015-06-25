var isArray = Array.isArray || function (arr) { return Object.prototype.toString.call(arr) == '[object Array]'; };

var postsBanListName = "be-fe.banList",
    commsBanListName = "be-fe.banListComms",
    parentOrigin = "",
    parentWindow = window.parent;

var m = /[?&]origin=([^&]+)/.exec(location.search);
if (m) {
    parentOrigin = decodeURIComponent(m[1]);
}

if (parentWindow === window) parentWindow = window.opener;
if (!parentWindow) {
    alert("Пожалуйста, откройте эту страницу по ссылке из FreeFeed-а.")
}

var getSettings = function (toApply) {
    var settingsNames = [
        "fix-names",
        "lightboxed-images",
        "bottom-comment-link",
        "colored-comment-icons",
        "at-links",
        "comment-icons-click",
        "animated-gif",
        "textarea-fix",
        "where-this-post-from",
        "userpics-in-comments",
        "embed-ly",
        "hide-aliens",
        "hide",
        "user-info",
        "comment-counters",
        "new-lines",
        "fold-images",
        "fold-texts"
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
        window.addEventListener('message', function (event) {
            if (event.origin === parentOrigin && self.loadResolver !== null) {
                self.loadResolver(isArray(event.data) ? event.data : getSettings(event.data));
                self.loadResolver = null;
            }
        });
    },

    loadSettings: function () {
        var self = this;
        return new Promise(function (resolve) {
            self.loadResolver = resolve;
            parentWindow.postMessage({action: "getSettings", value: null}, parentOrigin);
        });
    },

    saveSettings: function (settings) {
        var self = this;
        return new Promise(function (resolve) {
            parentWindow.postMessage({action: "saveSettings", value: settings}, parentOrigin);
            setTimeout(resolve, 0);
        });
    },

    loadBanList: function (name) {
        var self = this;
        return new Promise(function (resolve) {
            self.loadResolver = resolve;
            parentWindow.postMessage({action: "getBanList", value: name}, parentOrigin);
        });
    },

    saveBanList: function (name, list) {
        var self = this;
        return new Promise(function (resolve) {
            parentWindow.postMessage({action: "saveBanList", value: [name, list]}, parentOrigin);
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

    var localLinks = document.querySelectorAll(".local-link");
    for (var i = 0; i < localLinks.length; i++) {
        localLinks[i].href += location.search;
    }


    var sPage = document.querySelector(".content.settings");
    var checkBoxes = Array.prototype.slice.call(sPage.querySelectorAll("input[type='checkbox']"));

    settingsStore.init();
    settingsStore.loadSettings().then(function (settings) {
        settingsStore.loadBanList(postsBanListName).then(function (postBanList) {
            settingsStore.loadBanList(commsBanListName).then(function (commBanList) {
                checkBoxes.forEach(function (box) {
                    box.checked = settings[box.value];
                });
                sPage.classList.remove("hidden");
                sPage.previousElementSibling.classList.add("hidden");
                document.getElementById("ban-list-posts").value = postBanList.join(", ");
                document.getElementById("ban-list-comms").value = commBanList.join(", ");
            });
        });
    });

    document.getElementById("save-settings").addEventListener("click", function (e) {
        var saveBtn = e.target;
        saveBtn.disabled = true;
        var settings = {};
        checkBoxes.forEach(function (box) { settings[box.value] = box.checked; });
        settingsStore.saveSettings(settings).then(function () {
            setTimeout(function () { saveBtn.disabled = false; }, 500);
        });
        var banList = document.getElementById("ban-list-posts").value.toLowerCase().match(/\w+/g);
        if (banList === null) banList = [];
        settingsStore.saveBanList(postsBanListName, banList);
        banList = document.getElementById("ban-list-comms").value.toLowerCase().match(/\w+/g);
        if (banList === null) banList = [];
        settingsStore.saveBanList(commsBanListName, banList);
    }, false);

    var refreshBtn = document.getElementById("check-updates");
    refreshBtn.classList.remove("hidden");
    refreshBtn.addEventListener("click", function () {
        refreshBtn.disabled = true;
        parentWindow.postMessage({action: "checkUpdates", value: null}, parentOrigin);
    }, false);
});


