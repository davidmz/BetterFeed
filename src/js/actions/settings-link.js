import h from "../utils/html.js";
import forSelect from "../utils/for-select.js";
import bfRoot from "../utils/bf-root.js";
import { authToken } from '../utils/current-user-id.js';
import escapeHTML from "../utils/escape-html.js";
require('../../less/lightbox.less');

/** @type {Element} */
var lightBoxCont = h(".light-box-container.be-fe-settingsLB");
var lightBox = h(".frf-co-light-box.hidden", h(".light-box-shadow", lightBoxCont));

var startVersion = localStorage['be-fe-version'];

setInterval(function () {
    var setBlock = document.querySelector(".be-fe-settingsLink");
    if (setBlock) {
        if (localStorage['be-fe-version'] === startVersion) {
            setBlock.classList.remove("be-fe-have-upgrade");
        } else {
            setBlock.classList.add("be-fe-have-upgrade");
        }
    }
}, 2000);

lightBox.addEventListener("click", function () {
    lightBoxCont.innerHTML = "";
    lightBox.classList.add("hidden");
});

function showSettings() {
    var url = bfRoot + '/src/options/options.html?origin=' + encodeURIComponent(location.origin);

    if (/iPhone|iPad/.test(navigator.userAgent)) {
        window.open(url, "_blank");
        return;
    }

    document.body.appendChild(lightBox);
    lightBoxCont.innerHTML = "";
    lightBoxCont.appendChild(h("iframe.light-box-iframe", {src: url, frameborder: "0"}));
    lightBox.classList.remove("hidden");
}

function showAccessToken() {
    document.body.appendChild(lightBox);
    lightBoxCont.innerHTML = `
    <div class="be-fe-popup-page">
        <p>
            Your access token is:
        </p>
        <p class="be-fe-access-token">
            ${escapeHTML(authToken)}
        </p>
        <p>
            <strong>WARNING:</strong> Keep your token secure at all times and do not share it with services you do not fully trust.
            They will be able to perform ANY operation on your behalf including changing your password and
            <strong>locking you out of your account</strong>.
        </p>
        <p>
            Giving your token to third party services provides them with FULL and UNLIMITED access to your account.
            You can not change the token, you cannot revert access once you give it out.
        </p>
        <p>
            If you suspect your token is being abused, contact <a href="mailto:freefeed.net@gmail.com">freefeed.net@gmail.com</a> <strong>immediately</strong>.
        </p>
        <p style="text-align: center">
            <button class="be-fe-close-popup-button">Close</button>
        </p>
    </div>
    `;
    lightBox.classList.remove("hidden");
    lightBoxCont.querySelector(".be-fe-popup-page").addEventListener('click', e => e.stopPropagation());
    lightBoxCont.querySelector(".be-fe-close-popup-button").addEventListener('click', () => {
        lightBoxCont.innerHTML = "";
        lightBox.classList.add("hidden");
    });
}

export default function (node) {
    if (!startVersion) return;

    node = node || document.body;

    var inSettingsHeader = node.querySelector(".p-settings-betterfeed-header");
    if (inSettingsHeader) {
        var addOnsBlock = inSettingsHeader.parentNode;
        if (!addOnsBlock.querySelector(".be-fe-settings-in-settings")) {
            var sLink = h("a.be-fe-settings-in-settings", "configure settings");
            var showTokenLink = h("a.be-fe-settings-in-settings", "show access token");
            addOnsBlock.insertBefore(
                h("p.bg-success.be-fe-green",
                    `BetterFeed enabled (${startVersion}) | `,
                    h("i.fa.fa-cog"), " ", sLink,
                    ' | ',
                    h("i.fa.fa-exclamation-triangle"), " ", showTokenLink
                ),
                forSelect(addOnsBlock, ":scope > p")[1]
            );
            sLink.addEventListener("click", () => showSettings());
            showTokenLink.addEventListener("click", () => showAccessToken());
        }
    }


    var sidebar = node.querySelector(".sidebar");
    if (!sidebar || sidebar.querySelector(".be-fe-settingsLink")) return;

    var link;
    sidebar.appendChild(
        h(".box.be-fe-settingsLink",
            h(".box-header-groups", "Add-ons"),
            h(".box-body",
                h("ul",
                    h("li",
                        link = h("a", "BetterFeed settings"),
                        h("div", {style: "font-size: 11px"}, startVersion, h("i.fa.fa-arrow-circle-up", {title: "Доступно обновление, перезагрузите страницу"}))
                    )
                )
            )
        )
    );

    link.addEventListener("click", () => showSettings());
}

