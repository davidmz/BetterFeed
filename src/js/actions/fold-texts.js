var forSelect = require("../utils/for-select");
var h = require("../utils/html");

var triggerHeight = 140,
    minHeight = 100;

module.exports = function (node, settings) {
    node = node || document.body;

    if (!settings["new-lines"]) {
        forSelect(node, ".p-timeline-post .comment-text, .p-timeline-post .body .text", function (node) {
            if (node.offsetHeight < triggerHeight) return;
            var isComment = node.classList.contains("comment-text");

            var cnt = null;
            if (isComment) {
                var d = node.nextSibling, n;
                cnt = node.appendChild(h("span.be-fe-comm-controls"));
                while (d) {
                    n = d.nextSibling;
                    cnt.appendChild(d);
                    d = n;
                }
            }

            node.classList.add("be-fe-folded-text");
            var link = h("a.be-fe-folded-text-read-more-link", "Read more\u2026");
            var rm = node.appendChild(h(".be-fe-folded-text-read-more", link));
            if (cnt) {
                rm.appendChild(cnt.cloneNode(true));
            }
            link.addEventListener("click", function () {
                node.classList.remove("be-fe-folded-text");
            });
        });

    } else {
        forSelect(node, ".p-timeline-post .comment-text, .p-timeline-post .body .text", function (node) {
            if (node.offsetHeight < triggerHeight) return;
            var isComment = node.classList.contains("comment-text");

            var lineHeight = isComment ? 16 : 19;
            node.classList.add("be-fe-folded-text-nl");
            var clipPara = null;
            forSelect(node, ":scope > p", function (para) {
                if (!clipPara && para.offsetTop + para.offsetHeight > triggerHeight) {
                    clipPara = para;
                    para.classList.add("be-fe-folded-text-para");
                    var nLines = Math.floor(para.offsetHeight / lineHeight);
                    var l;
                    for (l = 1; l <= nLines; l++) {
                        if (para.offsetTop + l * lineHeight > minHeight) {
                            break;
                        }
                    }
                    para.style.height = (l * lineHeight) + "px";

                    var link = h("a.be-fe-folded-text-read-more-link", "Read more\u2026");
                    var rm = para.appendChild(h(".be-fe-folded-text-read-more", link));
                    link.addEventListener("click", function () {
                        node.classList.remove("be-fe-folded-text-nl");
                        clipPara.style.height = "auto";
                    });

                    var cnt = node.querySelector(".be-fe-comm-controls");
                    if (cnt) {
                        rm.appendChild(cnt.cloneNode(true));
                    }

                } else if (clipPara) {
                    para.classList.add("be-fe-folded-text-hidden");
                }
            });

        });
    }
};

