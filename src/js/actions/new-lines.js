import forSelect from "../utils/for-select.js";
import h from "../utils/html.js";
require('../../less/new-lines.less');

var replaceTextNode = function (node, re, str) {
    if (node && node.nodeType == Node.TEXT_NODE) node.nodeValue = node.nodeValue.replace(re, str);
};

export default function (node) {
    if (node === undefined) {
        document.addEventListener("keydown", function (e) {
            if (e.keyCode === 13 && e.target.tagName == "TEXTAREA" && e.target.classList.contains("ember-text-area")) {
                if (e.shiftKey) {
                    var ta = e.target, t = ta.value, ss = ta.selectionStart;
                    ta.value = t.substr(0, ss) + "\n" + t.substr(ta.selectionEnd);
                    ta.setSelectionRange(ss + 1, ss + 1);

                    var evt = document.createEvent('Event');
                    evt.initEvent('autosize:update', true, false);
                    ta.dispatchEvent(evt);
                }
            }
        }, true);

        document.addEventListener("keyup", function (e) {
            if (e.keyCode === 13 && e.target.tagName == "TEXTAREA" && e.target.classList.contains("ember-text-area")) {
                if (e.shiftKey) e.stopPropagation();
            }
        }, true);
    }

    node = node || document.body;

    forSelect(node, ".comment-text, .post-body .text", function (node) {
        replaceTextNode(node.firstChild, /^\s+/, "");
        replaceTextNode(node.lastChild, /\s+$/, "");

        var fr = document.createDocumentFragment(),
            para = fr.appendChild(h("p")),
            n,
            c, d;

        c = node.firstChild;
        while (c) {
            n = c.nextSibling;
            if (c.nodeType === Node.TEXT_NODE && /\n/.test(c.nodeValue)) {
                c.nodeValue.split(/\n{2,}/).forEach(function (s, i) {
                    if (i > 0) {
                        para = fr.appendChild(h("p"));
                    }
                    // single <br>s
                    s.split(/\n/).forEach(function (s, i) {
                        if (i > 0) {
                            para.appendChild(h("br"));
                        }
                        para.appendChild(document.createTextNode(s));
                    });
                });
                c.parentNode.removeChild(c);
            } else {
                para.appendChild(c);
            }
            c = n;
        }
        d = node.nextSibling;
        if (node.classList.contains("comment-text")) {
            // мы в комментарии
            var cnt = para.appendChild(h("span.be-fe-comm-controls"));
            while (d) {
                n = d.nextSibling;
                cnt.appendChild(d);
                d = n;
            }
        }

        node.appendChild(fr);
    });
}

