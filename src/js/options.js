import Settings  from "./settings.js";
import Messenger from "./utils/message-rpc.js";
import docLoaded from "./utils/doc-loaded.js";
import forSelect from "./utils/for-select.js";
import Cell      from "./utils/cell.js";

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
        settings.banPosts = banList;

        banList = document.getElementById("ban-list-comms").value.toLowerCase().match(/\w+/g);
        if (banList === null) banList = [];
        settings.banComms = banList;

        settings.bgImage = document.getElementById("bg-image").value.replace(/^\s+|\s+$/, '');

        msg.send(parentWindow, parentOrigin, "saveSettings", settings).then(() => btn.disabled = false);
    });

    msg.send(parentWindow, parentOrigin, "getSettings").then(sData => {
        settings = new Settings(undefined, sData);
        checkBoxes.forEach(box => box.checked = settings.flag(box.value));

        document.getElementById("ban-list-posts").value = settings.banPosts.join(", ");
        document.getElementById("ban-list-comms").value = settings.banComms.join(", ");
        document.getElementById("bg-image").value = settings.bgImage;

        let picker = document.createElement("input");
        picker.type = "color";
        document.getElementById("bg-image-picker").addEventListener("click", () => {
            picker.click();
        });

        // Взаимосвязь между флагами
        forSelect(sPage, "[data-disabled-if]", node => {
            var k = node.dataset["disabledIf"],
                c = document.getElementById(k);
            if (c) {
                Cell.fromInput(c).onValue(checked => node.disabled = checked);
            }
        });

        forSelect(sPage, "[data-enabled-if]", node => {
            var k = node.dataset["enabledIf"],
                c = document.getElementById(k);
            if (c) {
                Cell.fromInput(c).onValue(checked => node.disabled = !checked);
            }
        });

        sPage.classList.remove("hidden");
        sPage.previousElementSibling.classList.add("hidden");
    });

});


