import forSelect from "../utils/for-select";
import h from "../utils/html";
import imgLoaded from "../utils/img-loaded";
import closestParent from "../utils/closest-parent";
import compensateScroll from "../utils/compensate-scroll";
var css = require("../../less/embeds.less");

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

            var bodyNext = body.nextSibling,
                m,
                embedNode, // = Promise.reject(),
                afterMount = el => compensateScroll(el);

            if ((m = /^https:\/\/(?:www\.)?instagram\.com\/p\/([^\/]+)/.exec(url)) !== null) {
                // https://instagram.com/developer/embedding/?hl=ru#oembed
                let id = m[1],
                    cssClass = css["instagram"],
                    image = h(`img.${cssClass}-image`, {src: `https://instagram.com/p/${id}/media/?size=m`});
                embedNode = Promise.resolve(
                    embedWrap(
                        h(`.${cssClass}`,
                            h("a.light-box-thumbnail", {
                                    href: url,
                                    target: "_blank",
                                    "data-image-src": `https://instagram.com/p/${id}/media/?size=l`
                                },
                                image
                            ),
                            h(`.be-fe-embed-byline`,
                                h("i.fa.fa-instagram.fa-lg"),
                                " ",
                                h("a", {href: url, target: "_blank"}, "View on INSTAGRAM")
                            )
                        )
                    )
                );
                afterMount = el => imgLoaded(image).then(() => compensateScroll(el));
            } else if (
                (m = /^https?:\/\/(?:www\.)?youtube\.com\/watch\?(?:v|.*?&v)=([a-zA-Z0-9_-]+)/.exec(url)) !== null ||
                (m = /^https?:\/\/(?:www\.)?youtube\.com\/v\/([a-zA-Z0-9_-]+)/.exec(url)) !== null ||
                (m = /^https?:\/\/youtu\.be\/([a-zA-Z0-9_-]+)/.exec(url)) !== null
            ) {
                let id = m[1],
                    cssClass = css["youtube"];
                embedNode = Promise.resolve(
                    embedWrap(
                        h(".be-fe-embed-video-cont",
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
                        )
                    )
                );

            } else if ((m = /^https:\/\/vimeo\.com\/(\d+)/.exec(url)) !== null) {
                let id = m[1];
                embedNode = Promise.resolve(
                    embedWrap(
                        h(".be-fe-embed-video-cont",
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
                        )
                    )
                );

            } else if ((m = /^https:\/\/clyp\.it\/(\w+)/.exec(url)) !== null) {
                let id = m[1];
                embedNode = Promise.resolve(
                    embedWrap(
                        h(`iframe`, {
                            src: `https://clyp.it/${id}/widget`,
                            frameborder: "0",
                            style: "width: 100%; max-width: 450px; height: 160px;"
                        })
                    )
                );
            } else if (/^https:\/\/soundcloud\.com\/([^\/]+)\/([^\/]+)$/.test(url)) {
                embedNode = fetch(`https://soundcloud.com/oembed?url=${encodeURIComponent(url)}&format=json`)
                    .then(resp => {
                        if (!resp.ok) {
                            throw new Error("Unsupported soundcloud url");
                        }
                        return resp.json()
                    })
                    .then(emb => {
                        let m = /api\.soundcloud\.com%2Ftracks%2F(\d+)/.exec(emb.html || "");
                        if (m === null) throw new Error("Cannot get track number from soundcloud");
                        return embedWrap(
                            h(`iframe`, {
                                src: "https://w.soundcloud.com/player/?" +
                                "auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&buying=false" +
                                "&url=" + encodeURIComponent(`https://api.soundcloud.com/tracks/${m[1]}`),
                                scrolling: "no",
                                frameborder: "no",
                                style: "width: 100%; max-width: 450px; height: 166px;"
                            })
                        );
                    });

            } else if (/^https:\/\/soundcloud\.com\/([^\/]+)$/.test(url)) {
                embedNode = fetch(`https://soundcloud.com/oembed?url=${encodeURIComponent(url)}&format=json`)
                    .then(resp => {
                        if (!resp.ok) {
                            throw new Error("Unsupported soundcloud url");
                        }
                        return resp.json()
                    })
                    .then(emb => {
                        let m = /api\.soundcloud\.com%2Fusers%2F(\d+)/.exec(emb.html || "");
                        if (m === null) {
                            throw new Error("Cannot get user number from soundcloud");
                        }
                        return embedWrap(
                            h(`iframe`, {
                                src: "https://w.soundcloud.com/player/?" +
                                "auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&buying=false" +
                                "&url=" + encodeURIComponent(`https://api.soundcloud.com/users/${m[1]}`),
                                scrolling: "no",
                                frameborder: "no",
                                style: "width: 100%; max-width: 450px; height: 400px;"
                            })
                        );
                    });

            } else if ((m = /^https:\/\/(?:docs\.google\.com\/(document|spreadsheets|presentation|drawings)|drive\.google\.com\/file)\/d\/([^\/]+)/.exec(url)) !== null) {
                // var docType = m[1];
                var docId = m[2];
                var img = h("img.be-fe-gdoc");
                img.onerror = function () { img.style.display = "none"; };
                img.src = "https://drive.google.com/thumbnail?id=" + docId + "&sz=w590-h236-p";
                embedNode = Promise.resolve(embedWrap(h("a", {href: url, target: "_blank"}, img)));
                afterMount = el => imgLoaded(img).then(() => compensateScroll(el));

            } else if ((m = /^https:\/\/itunes\.apple\.com\/(?:[a-z]{2}\/)?app\/id(\d+)/.exec(url)) !== null) {
                let iframe = h(`iframe`, {
                    src: `https://widgets.itunes.apple.com/widget.html?c=us&brc=FFFFFF&blc=FFFFFF&trc=FFFFFF&tlc=FFFFFF&d=&t=&m=software&e=software,iPadSoftware&w=325&h=300&ids=${m[1]}&wt=discovery&partnerId=&affiliate_id=&at=&ct=`,
                    frameborder: "0"
                });
                iframe.style.cssText = "overflow-x:hidden;overflow-y:hidden;width:325px;height: 300px;border:0px";
                embedNode = Promise.resolve(embedWrap(iframe));

            } else if ((m = /^https?:\/\/coub\.com\/view\/([^\/?#]+)/.exec(url)) !== null) {
                let id = m[1];
                embedNode = fetch(`https://davidmz.me/oembed/coub/oembed.json?url=${encodeURIComponent(url)}`)
                    .then(resp => resp.json())
                    .then(j => {
                        var width = parseInt(j.width);
                        var height = parseInt(j.height);
                        if (width > 450) {
                            height = Math.round(height * 450 / width);
                            width = 450;
                        }
                        return embedWrap(
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
                    });

            } else if ((m = /^https?:\/\/i\.imgur\.com\/([^.\/]+)\.gifv$/.exec(url)) !== null) {
                let id = m[1];
                let video = h("video", {muted: "", loop: "", title: "Click to play/pause"},
                    h("source", {src: `//i.imgur.com/${id}.webm`, type: "video/webm"}),
                    h("source", {src: `//i.imgur.com/${id}.mp4`, type: "video/mp4"})
                );
                let wrapper = h(".be-fe-gifv", video);
                video.addEventListener("click", () => {
                    if (video.paused) {
                        video.play();
                        wrapper.classList.add("-playing");
                    } else {
                        video.pause();
                        wrapper.classList.remove("-playing");
                    }
                });

                let metadataLoaded = new Promise(resolve => video.addEventListener("loadedmetadata", () => resolve()));

                embedNode = Promise.resolve(embedWrap(wrapper));
                afterMount = el => metadataLoaded.then(() => compensateScroll(el));

            } else if ((m = /^https?:\/\/giphy\.com\/gifs\/([^.\/]+)$/.exec(url)) !== null) {
                let id = m[1];
                let video = h("video", {muted: "", loop: "", title: "Click to play/pause"},
                    h("source", {src: `https://media.giphy.com/media/${id}/giphy.mp4`, type: "video/mp4"})
                );
                let wrapper = h(".be-fe-gifv", video);
                video.addEventListener("click", () => {
                    if (video.paused) {
                        video.play();
                        wrapper.classList.add("-playing");
                    } else {
                        video.pause();
                        wrapper.classList.remove("-playing");
                    }
                });

                let metadataLoaded = new Promise(resolve => video.addEventListener("loadedmetadata", () => resolve()));

                embedNode = Promise.resolve(embedWrap(wrapper));
                afterMount = el => metadataLoaded.then(() => compensateScroll(el));

            } else {
                embedNode = Promise.resolve(embedWrap(h("a.embedly-card", {
                    href: link.href,
                    "data-card-width": "60%"
                })));
            }

            embedNode.then(el => {
                node.insertBefore(el, bodyNext);
                afterMount(el);
            }).catch(x => console.log(x));

            return true;
        });
    });
}

function embedWrap(el) { return h(".be-fe-embeds", h("", el));}

