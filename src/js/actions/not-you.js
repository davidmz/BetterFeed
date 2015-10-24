import forSelect from "../utils/for-select";
import IAm from "../utils/i-am";
import escapeHTML from "../utils/escape-html";

/**
 *
 * @param {HTMLElement|null} node
 * @param {Settings} settings
 */
export default function (node, settings) {

    if (settings.flag("fix-names")) return;

    node = node || document.body;

    IAm.ready.then(iAm => {
        forSelect(node, `a[href='/${iAm.me}']:not(.be-fe-at-link)`, node => {
            if (node.firstElementChild && (node.firstElementChild.nodeName == "IMG" || node.firstElementChild.nodeName == "DIV")) return;
            var h = escapeHTML(iAm.myScreenName);
            if (settings.flag("show-usernames") && iAm.me !== iAm.myScreenName) {
                h += ` <span class="be-fe-username">(${escapeHTML(iAm.me)})</span>`;
            }
            node.innerHTML = h;
        });
    });
};
