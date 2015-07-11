var forSelect = require("../utils/for-select");
var IAm = require("../utils/i-am");

module.exports = function (node, settings) {
    if (settings["fix-names"]) return;

    node = node || document.body;

    IAm.ready.then(function (iAm) {
        forSelect(node, "a[href='/" + iAm.me + "']", function (node) {
            if (node.innerHTML === "You") {
                node.innerHTML = escapeHTML(iAm.myScreenName);
            }
        });
    });

};

function escapeHTML(s) {
    return s.replace(/\&/g, "&amp;")
        .replace(/\</g, "&lt;").replace(/\>/g, "&gt;")
        .replace(/\"/g, "&quot;").replace(/\'/g, "&#x27;");
}