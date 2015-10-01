import forSelect from "../utils/for-select.js";
import h from "../utils/html.js";
var css = require("../../less/embeds.less");

export default function (node) {
    if (!node) {
        (function (w, d) {
            var id = 'embedly-platform', n = 'script';
            if (!d.getElementById(id)) {
                w.embedly = w.embedly || function () {(w.embedly.q = w.embedly.q || []).push(arguments);};
                var e = d.createElement(n);
                e.id = id;
                e.async = 1;
                e.src = 'https://cdn.embedly.com/widgets/platform.js';
                var s = d.getElementsByTagName(n)[0];
                s.parentNode.insertBefore(e, s);
            }
        })(window, document);

        embedly('on', 'card.rendered', function (iframe) { iframe.style.margin = "10px 0"; });
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

            if (!/^https?:\/\//.test(url)) {
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

            var bodyNext = body.nextSibling;
            var embed, m;
            if ((m = /^https:\/\/instagram\.com\/p\/([^\/]+)/.exec(url)) !== null) {
                // https://instagram.com/developer/embedding/?hl=ru#oembed
                let id = m[1],
                    cssClass = css["instagram"];
                embed = h(`.${cssClass}`,
                    h("a.light-box-thumbnail", {
                            href: url,
                            target: "_blank",
                            "data-image-src": `https://instagram.com/p/${id}/media/?size=l`
                        },
                        h(`img.${cssClass}-image`, {src: `https://instagram.com/p/${id}/media/?size=m`})
                    ),
                    h(`.be-fe-embed-byline`,
                        h("i.fa.fa-instagram.fa-lg"),
                        " ",
                        h("a", {href: url, target: "_blank"}, "View on INSTAGRAM")
                    )
                );
            } else if (
                (m = /^https?:\/\/(?:www\.)?youtube\.com\/watch\?(?:v|.*?&v)=([a-zA-Z0-9_-]+)/.exec(url)) !== null ||
                (m = /^https?:\/\/(?:www\.)?youtube\.com\/v\/([a-zA-Z0-9_-]+)/.exec(url)) !== null ||
                (m = /^https?:\/\/youtu\.be\/([a-zA-Z0-9_-]+)/.exec(url)) !== null
            ) {
                let id = m[1],
                    cssClass = css["youtube"];
                embed = h(".be-fe-embed-video-cont",
                    h(`.be-fe-embed-video-wrapper`,
                        h(`iframe`, {
                            src: `https://www.youtube.com/embed/${id}?rel=0&hd=1&fs=1`,
                            frameborder: "0",
                            allowfullscreen: ""
                        })
                    ),
                    h(`.be-fe-embed-byline`,
                        h("i.fa.fa-youtube-play.fa-lg"),
                        " ",
                        h("a", {href: url, target: "_blank"}, "View on YOUTUBE")
                    )
                );
            } else if ((m = /^https:\/\/vimeo\.com\/(\d+)/.exec(url)) !== null) {
                let id = m[1];
                embed = h(".be-fe-embed-video-cont",
                    h(`.be-fe-embed-video-wrapper`,
                        h(`iframe`, {
                            src: `https://player.vimeo.com/video/${id}`,
                            frameborder: "0",
                            allowfullscreen: ""
                        })
                    ),
                    h(`.be-fe-embed-byline`,
                        h("i.fa.fa-vimeo-square.fa-lg"),
                        " ",
                        h("a", {href: url, target: "_blank"}, "View on VIMEO")
                    )
                );
            } else if ((m = /^https:\/\/docs\.google\.com\/(document|spreadsheets|presentation|drawings)\/d\/([^\/]+)/.exec(url)) !== null) {
                // var docType = m[1];
                var docId = m[2];
                var img = h("img.be-fe-gdoc");
                img.onerror = function () { img.style.display = "none"; };
                img.src = "https://drive.google.com/thumbnail?id=" + docId + "&sz=w590-h236-p";
                embed = h("a", {href: url, target: "_blank"}, img);

            } else if ((m = /^https:\/\/itunes\.apple\.com\/app\/id(\d+)/.exec(url)) !== null) {
                embed = h(`iframe`, {
                    src: `https://widgets.itunes.apple.com/widget.html?c=us&brc=FFFFFF&blc=FFFFFF&trc=FFFFFF&tlc=FFFFFF&d=&t=&m=software&e=software,iPadSoftware&w=325&h=300&ids=${m[1]}&wt=discovery&partnerId=&affiliate_id=&at=&ct=`,
                    frameborder: "0"
                });
                embed.style.cssText = "overflow-x:hidden;overflow-y:hidden;width:325px;height: 300px;border:0px";

            } else if ((m = /^https?:\/\/coub\.com\/view\/([^\/?#]+)/.exec(url)) !== null) {
                let id = m[1];
                embed = new Promise((resolve) => {
                    var xhr = new XMLHttpRequest();
                    xhr.open('GET', `https://davidmz.me/oembed/coub/oembed.json?url=${encodeURIComponent(url)}`);
                    xhr.responseType = 'json';
                    xhr.onload = function () {
                        var width = parseInt(xhr.response.width);
                        var height = parseInt(xhr.response.height);
                        if (width > 450) {
                            height = Math.round(height * 450 / width);
                            width = 450;
                        }
                        resolve(
                            h("div",
                                h("iframe", {
                                    src: `https://coub.com/embed/${id}?muted=false&autostart=false&originalSize=false&hideTopBar=false&startWithHD=true`,
                                    allowfullscreen: "true",
                                    frameborder: "0",
                                    style: `width: ${width}px; height: ${height}px;`
                                }),
                                h(`.be-fe-embed-byline`,
                                    h("a", {href: url, target: "_blank"}, "View on COUB")
                                )
                            )
                        );
                    };
                    xhr.send();
                });

            } else {
                embed = h("a.embedly-card", {href: link.href, "data-card-width": "60%"});
            }

            if ("then" in embed) {
                embed.then(el => {
                    node.insertBefore(h(".be-fe-embeds", el), bodyNext);
                });
            } else {
                node.insertBefore(h(".be-fe-embeds", embed), bodyNext);
            }
            return true;
        });
    });
}

