import Settings  from "./settings.js";
import Messenger from "./utils/message-rpc.js";
import docLoaded from "./utils/doc-loaded.js";
import forSelect from "./utils/for-select.js";
import Cell      from "./utils/cell.js";
import {Base64}  from "js-base64";

const parentWindow = (window.parent === window) ? window.opener : window.parent;

if (!parentWindow || !/[?&]origin=([^&]+)/.exec(location.search)) {
    alert("Пожалуйста, откройте эту страницу по ссылке из FreeFeed-а");
}

const parentOrigin = decodeURIComponent(/[?&]origin=([^&]+)/.exec(location.search)[1]);

docLoaded.then(() => {
    const
        ver = location.pathname.match(/BetterFeed\/([^\/]+)/),
        sPage = document.querySelector(".content.settings"),
        saveButton = document.getElementById("save-settings"),
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

    saveButton.addEventListener("click", () => {
        checkBoxes.forEach(box => settings.setFlag(box.value, box.checked));

        var banList = document.getElementById("ban-list-posts").value.toLowerCase().match(/\w+/g);
        if (banList === null) banList = [];
        settings.banPosts = banList;

        banList = document.getElementById("ban-list-comms").value.toLowerCase().match(/\w+/g);
        if (banList === null) banList = [];
        settings.banComms = banList;

        settings.bgImage = document.getElementById("bg-image").value.replace(/^\s+|\s+$/, '');

        msg.send(parentWindow, parentOrigin, "saveSettings", settings);
    });

    let isChanged = new Cell(false);
    let initialState = new Map;
    let currentState = () => {
        let state = new Map;
        forSelect(sPage, "input, textarea", inp => {
            state.set(inp.id, (inp.type === "checkbox") ? inp.checked : inp.value);
        });
        return state;
    };

    document.getElementById("export-btn").addEventListener("click", ({target: a}) => {
        let str = JSON.stringify(settings.exportData());
        a.href = 'data:application/json;base64,' + Base64.encode(str);
    });

    let importInput = document.getElementById("import-input");
    importInput.addEventListener("change", () => {
        if (importInput.files.length == 0) return;
        let file = importInput.files[0];
        if (file.size > 100000) {
            alert("Файл слишком велик");
            importInput.value = "";
            return;
        }
        importInput.value = "";

        let reader = new FileReader();
        reader.onload = () => {
            try {
                let o = JSON.parse(reader.result);
                if (confirm("Применить загруженные настройки и перезагрузить страницу?")) {
                    settings.importData(o);
                    msg.send(parentWindow, parentOrigin, "saveSettings", settings);
                }
            } catch (e) {
                alert("Некорректный формат файла");
            }
        };
        reader.readAsText(file);
    });

    let updateInputs = () => {
        checkBoxes.forEach(box => box.checked = settings.flag(box.value));
        document.getElementById("ban-list-posts").value = settings.banPosts.join(", ");
        document.getElementById("ban-list-comms").value = settings.banComms.join(", ");
        document.getElementById("bg-image").value = settings.bgImage;
    };

    msg.send(parentWindow, parentOrigin, "getSettings").then(sData => {
        settings = new Settings(undefined, sData);
        updateInputs();

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

        initialState = currentState();

        sPage.classList.remove("hidden");
        sPage.previousElementSibling.classList.add("hidden");
    });


    let changeHandler = () => {
        let st = currentState(), changed = false;
        st.forEach((v, k) => changed = changed || (v !== initialState.get(k)));
        isChanged.value = changed;
    };

    sPage.addEventListener("input", changeHandler);
    sPage.addEventListener("change", changeHandler);

    isChanged.distinct().onValue(s => saveButton.disabled = !s);
});


