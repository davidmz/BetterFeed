import forSelect from "../utils/for-select";
import h from "../utils/html";
import compensateScroll from "../utils/compensate-scroll";

export default function (node) {
    node = node || document.body;

    forSelect(node, ".general-attachments .attachment:not(.be-fe-with-preview)", (node) => {
        var link = node.querySelector(".p-attachment-url");
        var text = link.title;
        var fileName = /(.*)\s+\(.*?\)$/.exec(text)[1];
        let pfn = /\.([^.]+)$/.exec(fileName);
        var fileExt = pfn ? pfn[1] : '';

        if (!link.download) {
            link.download = fileName;
            link.removeAttribute("target");
        }
        if (/\.null$/.test(link.href)) {
            link.href = link.href.replace(/\.null$/, "");
        }

        if (["txt", "doc", "docx", "xls", "xlsx", "pdf", "ppt"].indexOf(fileExt.toLowerCase()) !== -1) {
            let att = attachWrap(
                h(".be-fe-doc-view-wrapper",
                    h("iframe.be-fe-doc-view-frame", {
                        frameborder: "0",
                        src: `https://docs.google.com/gview?url=${encodeURIComponent(link.href)}&embedded=true`
                    })
                )
            );
            node.classList.add("be-fe-with-preview");
            node.insertBefore(att, node.firstChild);
            compensateScroll(att);
        }

        if (fileExt === "mp4") {
            let v = h("video");
            v.addEventListener("loadedmetadata", () => {
                var sw = v.videoWidth;
                var sh = v.videoHeight;
                var max = Math.max(sw, sh);
                if (max > 400) {
                    sw *= 400 / max;
                    sh *= 400 / max;
                }
                v.width = sw;
                v.height = sh;
                v.controls = true;
                v.loop = true;

                let att = attachWrap(v);

                node.classList.add("be-fe-with-preview");
                node.insertBefore(h(".be-fe-video-view-wrapper", att), node.firstChild);
                compensateScroll(att);
            });
            v.src = link.href;
        }
    });
}

function attachWrap(el) { return h(".be-fe-attach-preview", h("", el));}