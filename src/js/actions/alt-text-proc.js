import forSelect from "../utils/for-select";
import linkify from "../utils/linkify";

export default function (node = document.body) {
    forSelect(node, ".comment-text, .post-body > .body > .text", node => {
        node.innerHTML = linkify(plainText(node));
        let shortLinks = forSelect(node, "a[href^='https://t.co/'], a[href^='https://goo.gl/']");
        if (shortLinks.length > 0) {
            Promise.all(
                shortLinks.map(async(node) => {
                    try {
                        let j = await fetch(`https://davidmz.me/frfrfr/uinfo/unsokr?url=${encodeURIComponent(node.href)}`)
                            .then(resp => resp.json());
                        if (j.status == "ok") {
                            node.insertAdjacentHTML('afterend', linkify(j.data));
                            node.parentNode.removeChild(node);
                        }
                    } catch (e) {
                    }
                })
            ).then(() => {
                node.parentNode.dispatchEvent(new Event("befeLinksChanged", {bubbles: true}));
            });
        }
    });
}

function plainText(elem) {
    let c = elem.firstChild, parts = [];
    while (c) {
        if (c.nodeType == Node.TEXT_NODE) {
            parts.push(c.nodeValue);
        } else if (c.nodeType == Node.ELEMENT_NODE && c.nodeName == "A") {
            let text = c.textContent,
                href = c.getAttribute("href");
            if (!/^https?:\/\//i.test(text)) {
                href = href.replace(/^https?:\/\//i, '');
            }
            if (text.charAt(text.length - 1) === "\u2026") {
                text = text.substr(0, text.length - 1);
            }

            if (href.substr(0, text.length).toLowerCase() === text.toLowerCase()) {
                href = text + href.substr(text.length);
            }

            href = href.replace(/^mailto:/, '');

            parts.push(href);
        }
        c = c.nextSibling;
    }
    return parts.join("");
}

