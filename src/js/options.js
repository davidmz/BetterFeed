import Settings  from "./settings.js";
import Messenger from "./utils/message-rpc.js";
import docLoaded from "./utils/doc-loaded.js";
import forSelect from "./utils/for-select.js";
import setToArray from "./utils/set-to-array.js";

const parentWindow = (window.parent === window) ? window.opener : window.parent;

if (!parentWindow || !/[?&]origin=([^&]+)/.exec(location.search)) {
    alert("Пожалуйста, откройте эту страницу по ссылке из FreeFeed-а");
}

const parentOrigin = decodeURIComponent(/[?&]origin=([^&]+)/.exec(location.search)[1]);


docLoaded.then(() => {
    const
        ver = location.pathname.match(/BetterFeed\/([^\/]+)/),
        sPage = document.querySelector(".content.settings"),
        checkBoxes = forSelect(sPage, "input[type='checkbox']"),
        msg = new Messenger();

    /** @type {Settings|null} */
    var settings = null;

    if (ver) {
        document.querySelector(".version").appendChild(document.createTextNode(ver[1]));
    }
    forSelect(document.body, ".local-link", link => link.href += location.search);

    document.getElementById("check-updates").addEventListener("click", e => {
        const btn = e.target;
        btn.disabled = true;
        msg.send(parentWindow, parentOrigin, "checkUpdates").then(() => btn.disabled = false);
    });

    document.getElementById("save-settings").addEventListener("click", (e) => {
        var btn = e.target;
        btn.disabled = true;

        checkBoxes.forEach(box => settings.setFlag(box.value, box.checked));

        var banList = document.getElementById("ban-list-posts").value.toLowerCase().match(/\w+/g);
        if (banList === null) banList = [];
        settings.banPosts = new Set(banList);

        banList = document.getElementById("ban-list-comms").value.toLowerCase().match(/\w+/g);
        if (banList === null) banList = [];
        settings.banComms = new Set(banList);

        msg.send(parentWindow, parentOrigin, "saveSettings", settings).then(() => btn.disabled = false);
    });

    msg.send(parentWindow, parentOrigin, "getSettings").then(sData => {
        settings = new Settings(undefined, sData);
        checkBoxes.forEach(box => box.checked = settings.flag(box.value));

        document.getElementById("ban-list-posts").value = setToArray(settings.banPosts).join(", ");
        document.getElementById("ban-list-comms").value = setToArray(settings.banComms).join(", ");
        sPage.classList.remove("hidden");
        sPage.previousElementSibling.classList.add("hidden");
    });

});


