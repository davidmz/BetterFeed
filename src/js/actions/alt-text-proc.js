import forSelect from "../utils/for-select";
import linkify from "../utils/linkify";

export default function (node = document.body) {
    forSelect(node, ".comment-text, .post-body > .body > .text", node => node.innerHTML = linkify(plainText(node)));
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
            parts.push(href);
        }
        c = c.nextSibling;
    }
    return parts.join("");
}

