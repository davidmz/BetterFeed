import forSelect from "../utils/for-select";
import closestParent from "../utils/closest-parent";
import h from "../utils/html";

export default function (node, options) {

    if (!node) {
        document.body.addEventListener("click", (e) => {
            var stub = closestParent(e.target, ".be-fe-nsfw-stub", true);
            if (stub) {
                closestParent(stub, ".post-body").classList.remove("be-fe-nsfw");
            }
        });
    }

    node = node || document.body;

    forSelect(node, ".post-body .text", function (node) {
        let isNSFW = false;
        forTexts(node, text => {
            if (!isNSFW) {
                isNSFW = /\B#nsfw\b/i.test(text);
            }
        });

        if (!isNSFW && options.nsfwUsers.length > 0) {
            let pc = closestParent(node, ".single-post-container, .timeline-post-container");
            isNSFW = options.nsfwUsers.some(u => pc.classList.contains(`be-fe-post-from-u-${u}`));
        }

        if (isNSFW) {
            let pb = closestParent(node, ".post-body");
            pb.classList.add("be-fe-nsfw");
            let info = pb.querySelector(":scope > .info");
            info.parentNode.insertBefore(h(".be-fe-nsfw-stub"), info);
        }
    });
}


/**
 *
 * @param {HTMLElement} elem
 * @param {function(string):string} foo
 */
function forTexts(elem, foo) {
    var c = elem.firstChild;
    while (c) {
        if (c.nodeType == Node.TEXT_NODE) {
            foo(c.nodeValue);
        } else if (c.nodeType == Node.ELEMENT_NODE) {
            if (c.nodeName !== "A") {
                forTexts(c, foo);
            }
        }
        c = c.nextSibling;
    }
}