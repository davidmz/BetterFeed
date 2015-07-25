var forSelect = require("../utils/for-select");
var h = require("../utils/html");

module.exports = function (node) {
    node = node || document.body;

    forSelect(node, ".general-attachments .attachment:not(.be-fe-with-preview)", (node) => {
        var link = node.querySelector(".p-attachment-url");
        var text = link.querySelector("span").textContent;
        var fileName = /(.*?)\s+\(.*?\)$/.exec(text)[1];
        var fileExt = /\.([^.]+)$/.exec(fileName)[1];

        if (!link.download) {
            link.download = fileName;
            link.removeAttribute("target");
        }
        if (/\.null$/.test(link.href)) {
            link.href = link.href.replace(/\.null$/, "");
        }

        if (["txt", "doc", "docx", "xls", "xlsx", "pdf", "ppt"].indexOf(fileExt.toLowerCase()) !== -1) {
            node.classList.add("be-fe-with-preview");
            node.insertBefore(
                h(".be-fe-doc-view-wrapper",
                    h("iframe.be-fe-doc-view-frame", {
                        frameborder: "0",
                        src: `https://docs.google.com/gview?url=${encodeURIComponent(link.href)}&embedded=true`
                    })
                ),
                node.firstChild
            );
        }
    });
};
