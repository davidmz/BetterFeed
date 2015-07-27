var forSelect = require("../utils/for-select");
var h = require("../utils/html");
var css = require("../../less/embeds.less");

module.exports = function (node) {
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

    forSelect(node, ".post-body", function (node) {
        if (node.querySelector(":scope > .attachments")) {
            return;
        }

        forSelect(node, ".text a").some(function (link) {
            if (!/^https?:\/\//.test(link.getAttribute("href"))) return false;
            var bodyNext = node.querySelector(":scope > .body").nextSibling;
            var url = link.href;
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
                            frameborder: "0"
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
                            frameborder: "0"
                        })
                    ),
                    h(`.be-fe-embed-byline`,
                        h("i.fa.fa-vimeo-square.fa-lg"),
                        " ",
                        h("a", {href: url, target: "_blank"}, "View on VIMEO")
                    )
                );
            } else if (
                url.indexOf("https://docs.google.com/document/d/") === 0
                || url.indexOf("https://docs.google.com/spreadsheets/d/") === 0
                || url.indexOf("https://docs.google.com/presentation/d/") === 0
            ) {
                var docId = /\/d\/([^\/]+)/.exec(url)[1];
                var img = h("img.be-fe-gdoc");
                img.onerror = function () { img.style.display = "none"; };
                img.src = "https://drive.google.com/thumbnail?id=" + docId + "&sz=w590-h236-p";
                embed = h("a", {href: url, target: "_blank"}, img);
            } else {
                embed = h("a.embedly-card", {href: link.href, "data-card-width": "60%"});
            }
            node.insertBefore(
                h(".be-fe-embeds", embed),
                bodyNext
            );
            return true;
        });
    });
};

