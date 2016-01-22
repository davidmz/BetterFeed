import forSelect from "../utils/for-select";
import h from "../utils/html";
import closestParent from "../utils/closest-parent";
import compensateScroll from "../utils/compensate-scroll";
import embedLink from "../utils/link-preview";
require("../../less/embeds.less");

export default function (node) {
    if (!node) {
        (function (w, d) {
            var id = 'embedly-platform', n = 'script';
            if (!d.getElementById(id)) {
                w.embedly = w.embedly || function () { (w.embedly.q = w.embedly.q || []).push(arguments); };
                var e = d.createElement(n);
                e.id = id;
                e.async = 1;
                e.src = 'https://cdn.embedly.com/widgets/platform.js';
                var s = d.getElementsByTagName(n)[0];
                s.parentNode.insertBefore(e, s);
            }
        })(window, document);

        embedly('on', 'card.rendered', iframe => iframe.style.margin = "10px 0");
        embedly('on', 'card.resize', iframe => compensateScroll(closestParent(iframe, ".be-fe-embeds")));
    }

    node = node || document.body;

    forSelect(node, ".body", body => {
        var node = body.parentNode;
        if (!node.classList.contains("post-body")) return;

        if (node.querySelector(":scope > .attachments")) {
            return;
        }

        forSelect(body, ".text a").some(link => {
            var url = link.getAttribute("href");

            if (!link.classList.contains("be-fe-url-with-proto") && !(/^https?:\/\//.test(url) && /^https?:\/\//.test(link.textContent))) {
                return false;
            }

            if (/^https:\/\/(m\.)?freefeed\.net\//.test(url)) {
                return false;
            }

            // Проверяем, нет ли прямо перед ссылкой восклицательного знака
            var prevTextEl = link.previousSibling;
            if (prevTextEl !== null) {
                let prevText = prevTextEl.nodeValue;
                if (prevText.length > 0 && prevText.charAt(prevText.length - 1) === "!") {
                    return false;
                }
            }

            let bodyNext = body.nextSibling;
            embedLink(url)
                .then(el => {
                    el = h(".be-fe-embeds", h("", el));
                    node.insertBefore(el, bodyNext);
                    compensateScroll(el);
                })
                .catch(x => console.log(x));

            return true;
        });
    });
}

