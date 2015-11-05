import forSelect from "../utils/for-select";
import h from "../utils/html";
import imgLoaded from "../utils/img-loaded.js";
import bfRoot from "../utils/bf-root.js";
require('../../less/emoji.less');


var basicEmoRoot = bfRoot + "/images/emoji/basic",
    customEmoRoot = bfRoot + "/images/emoji/custom",
    customEmoList = ["neechowsee"],
    aliases = {
        "ничоси": "neechowsee",
        "skeleton": "skull",
        "poo": "poop",
        "flame": "fire",
        "grandma": "older_woman"
    };

export default function (node) {
    node = node || document.body;

    forSelect(node, ".comment-text, .post-body .text", function (node) {
        emojize(node);
    });
};

function emojize(node) {
    if (!node) return;
    if (node.nodeType == Node.ELEMENT_NODE) {
        var c, n;
        c = node.firstChild;
        while (c) {
            n = c.nextSibling;
            if (!node.classList.contains("author")) {
                emojize(c);
            }
            c = n;
        }
    }
    var emoRe = /:([+-]1|e-mail|non-potable_water|ничоси|[a-z0-9_]+):|((?:[\uD800-\uDBFF][\uDC00-\uDFFF])+)|([\u2702-\u27B0\u24C2\u2139\u2300-\u32FF])|(.[\u20E3])/g;
    if (node.nodeType == Node.TEXT_NODE && emoRe.test(node.nodeValue)) {
        emoRe.lastIndex = 0;
        var text = node.nodeValue, match, prevPos = 0, fr = document.createDocumentFragment();
        while ((match = emoRe.exec(text)) !== null) {
            if (match.index != prevPos) {
                fr.appendChild(document.createTextNode(text.substr(prevPos, match.index - prevPos)));
            }
            var i, uni, eNode;
            if (match[1] !== undefined) { // names
                eNode = fr.appendChild(document.createTextNode(match[0]));
                emoCheck(eNode, match[1], match[0], false);
            } else if (match[2] !== undefined) { // (many) surrogate pairs
                var txt = match[2], pairs = surPairs(txt), s, code;
                for (i = 0; i < pairs.length; i++) {
                    if (isGeo(pairs[i]) && i < pairs.length - 1 && isGeo(pairs[i + 1])) {
                        s = txt.substr(i * 2, 4);
                        code = hexInt(pairs[i]) + "-" + hexInt(pairs[i + 1]);
                        i++;
                    } else {
                        s = txt.substr(i * 2, 2);
                        code = hexInt(pairs[i]);
                    }
                    eNode = fr.appendChild(document.createTextNode(s));
                    emoCheck(eNode, code, s, true);
                }
            } else if (match[3] !== undefined) { // dingbats and others 1-symbol
                eNode = fr.appendChild(document.createTextNode(match[0]));
                uni = match[3].charCodeAt(0);
                emoCheck(eNode, hexInt(uni), match[0], true);
            } else if (match[4] !== undefined) { // 2-symbol
                eNode = fr.appendChild(document.createTextNode(match[0]));
                emoCheck(eNode, hexInt(match[4].charCodeAt(0)) + "-" + hexInt(match[4].charCodeAt(1)), match[0], true);
            }
            prevPos = match.index + match[0].length;
        }
        if (text.length != prevPos) {
            fr.appendChild(document.createTextNode(text.substr(prevPos)));
        }
        node.parentNode.insertBefore(fr, node);
        node.parentNode.removeChild(node);
    }
}

function surPairs(text) {
    var i, pairs = [];
    for (i = 0; i < text.length; i += 2) {
        pairs.push((text.charCodeAt(i) - 0xD800) * 0x400 + (text.charCodeAt(i + 1) - 0xDC00) + 0x10000);
    }
    return pairs;
}

function isGeo(uni) { return (uni >= 0x1F1E6 && uni <= 0x1F1FF);}

async function emoCheck(node, emo, alt, unicode) {
    var code = (emo in aliases) ? aliases[emo] : emo;
    var dir = (customEmoList.indexOf(code) !== -1) ? customEmoRoot : basicEmoRoot;
    if (unicode) {
        dir += "/unicode";
    }
    var img = h("img.be-fe-emo", {src: dir + "/" + code + ".png", alt: alt});
    if (!unicode) {
        img.title = ":" + emo + ":";
    }
    await imgLoaded(img);
    node.parentNode.insertBefore(h("span.be-fe-emo-wrap", img), node);
    node.parentNode.removeChild(node);
}

function hexInt(n) {
    var s = n.toString(16);
    while (s.length < 4) s = "0" + s;
    return s.toUpperCase();
}