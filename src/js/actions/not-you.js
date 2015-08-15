var forSelect = require("../utils/for-select");
var IAm = require("../utils/i-am");
var escapeHTML = require("../utils/escape-html");

module.exports = function (node, settings) {
    if (settings["fix-names"]) return;

    node = node || document.body;

    IAm.ready.then((iAm) => {
        forSelect(node, `a[href='/${iAm.me}']`, (node) => {
            if (node.firstElementChild && node.firstElementChild.nodeName == "IMG") return;
            var h = escapeHTML(iAm.myScreenName);
            if (settings["show-usernames"] && iAm.me !== iAm.myScreenName) {
                h += ` <span class="be-fe-username">(${escapeHTML(iAm.me)})</span>`;
            }
            node.innerHTML = h;
        });
    });
};
