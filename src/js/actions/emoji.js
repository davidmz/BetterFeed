var forSelect = require("../utils/for-select");
var imgLoaded = require("../utils/img-loaded");
var h = require("../utils/html");
var bfRoot = require("../utils/bf-root");
require('../../less/emoji.less');


var emoImagesDir = "https://cdn.rawgit.com/Ranks/emojify.js/1.0.5/dist/images/basic",
    emoImagesAltDir = bfRoot + "/images/emoji",
    altEmoji = ["neechowsee"],
    emoTrans = {"ничоси": "neechowsee"};

module.exports = function (node) {
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
            emojize(c);
            c = n;
        }
    }
    var emoRe = /:([+-]1|ничоси|[a-z0-9_]+):/g;
    if (node.nodeType == Node.TEXT_NODE && emoRe.test(node.nodeValue)) {
        emoRe.lastIndex = 0;
        var text = node.nodeValue, match, prevPos = 0, fr = document.createDocumentFragment();
        while ((match = emoRe.exec(text)) !== null) {
            if (match.index != prevPos) {
                fr.appendChild(document.createTextNode(text.substr(prevPos, match.index - prevPos)));
            }
            var eNode = fr.appendChild(document.createTextNode(match[0]));
            emoCheck(eNode, match[1]);
            prevPos = match.index + match[0].length;
        }
        if (text.length != prevPos) {
            fr.appendChild(document.createTextNode(text.substr(prevPos)));
        }
        node.parentNode.insertBefore(fr, node);
        node.parentNode.removeChild(node);
    }
}

function emoCheck(node, emo) {
    var code = (emo in emoTrans) ? emoTrans[emo] : emo;
    var dir = (altEmoji.indexOf(code) !== -1) ? emoImagesAltDir : emoImagesDir;
    var img = h("img.be-fe-emo", {
        src: dir + "/" + code + ".png",
        alt: ":" + emo + ":",
        title: ":" + emo + ":"
    });
    imgLoaded(img).then(function () {
        node.parentNode.insertBefore(h("span.be-fe-emo-wrap", img), node);
        node.parentNode.removeChild(node);
    });
}