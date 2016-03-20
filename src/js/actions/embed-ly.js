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

        document.body.addEventListener("befeLinksChanged", e => processBody(e.target));
    }

    node = node || document.body;

    forSelect(node, ".body", processBody);
}

function processBody(body) {
    var bodyParent = body.parentNode;
    if (!bodyParent.classList.contains("post-body")) return;

    if (bodyParent.querySelector(":scope > .attachments")) {
        return;
    }

    let oldEmbeds = bodyParent.querySelector(".be-fe-embeds");
    if (oldEmbeds) {
        bodyParent.removeChild(oldEmbeds);
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

        let bodyNext = body.nextSibling,
            emb = h(".be-fe-embeds");
        bodyParent.insertBefore(emb, bodyNext);
        embedLink(url)
            .then(el => {
                emb.appendChild(h("", el));
                if (emb.parentNode) {
                    compensateScroll(emb);
                }
            })
            .catch(x => console.log(x));

        return true;
    });
}