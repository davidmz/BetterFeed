import compensateScroll from "../utils/compensate-scroll";
import h from "../utils/html";
import imgLoaded from "../utils/img-loaded";

function embedLink(url) {
    let m;

    if ((m = /^https:\/\/(?:www\.)?instagram\.com\/p\/([^\/]+)/.exec(url)) !== null) {
        // https://instagram.com/developer/embedding/?hl=ru#oembed
        let id = m[1],
            image = h(`img.be-fe-embed-instagram-image`, {src: `https://instagram.com/p/${id}/media/?size=m`});

        let el = h(`.be-fe-embed-instagram`,
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
        );
        return imgLoaded(image).then(() => el);

    } else if (
        (m = /^https?:\/\/(?:www\.)?youtube\.com\/watch\?(?:v|.*?&v)=([a-zA-Z0-9_-]+)/.exec(url)) !== null ||
        (m = /^https?:\/\/(?:www\.)?youtube\.com\/v\/([a-zA-Z0-9_-]+)/.exec(url)) !== null ||
        (m = /^https?:\/\/youtu\.be\/([a-zA-Z0-9_-]+)/.exec(url)) !== null
    ) {
        let id = m[1];
        return Promise.resolve(
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
        );

    } else if ((m = /^https:\/\/vimeo\.com\/(\d+)/.exec(url)) !== null) {
        let id = m[1];
        return Promise.resolve(
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
        );

    } else if ((m = /^https:\/\/clyp\.it\/(\w+)/.exec(url)) !== null) {
        let id = m[1];
        return Promise.resolve(
            h(`iframe`, {
                src: `https://clyp.it/${id}/widget`,
                frameborder: "0",
                style: "width: 100%; max-width: 450px; height: 160px;"
            })
        );
    } else if (/^https:\/\/soundcloud\.com\/([^\/]+)\/([^\/]+)$/.test(url)) {
        return fetch(`https://soundcloud.com/oembed?url=${encodeURIComponent(url)}&format=json`)
            .then(resp => {
                if (!resp.ok) {
                    throw new Error("Unsupported soundcloud url");
                }
                return resp.json()
            })
            .then(emb => {
                let m = /api\.soundcloud\.com%2Ftracks%2F(\d+)/.exec(emb.html || "");
                if (m === null) throw new Error("Cannot get track number from soundcloud");
                return h(`iframe`, {
                    src: "https://w.soundcloud.com/player/?" +
                    "auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&buying=false" +
                    "&url=" + encodeURIComponent(`https://api.soundcloud.com/tracks/${m[1]}`),
                    scrolling: "no",
                    frameborder: "no",
                    style: "width: 100%; max-width: 450px; height: 166px;"
                });
            });

    } else if (/^https:\/\/soundcloud\.com\/([^\/]+)$/.test(url)) {
        return fetch(`https://soundcloud.com/oembed?url=${encodeURIComponent(url)}&format=json`)
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
                return h(`iframe`, {
                    src: "https://w.soundcloud.com/player/?" +
                    "auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&buying=false" +
                    "&url=" + encodeURIComponent(`https://api.soundcloud.com/users/${m[1]}`),
                    scrolling: "no",
                    frameborder: "no",
                    style: "width: 100%; max-width: 450px; height: 400px;"
                });
            });

    } else if ((m = /^https:\/\/(?:docs\.google\.com\/(document|spreadsheets|presentation|drawings)|drive\.google\.com\/file)\/d\/([^\/]+)/.exec(url)) !== null) {
        // var docType = m[1];
        var docId = m[2];
        var img = h("img.be-fe-gdoc");
        img.onerror = function () { img.style.display = "none"; };
        img.src = "https://drive.google.com/thumbnail?id=" + docId + "&sz=w590-h236-p";
        return imgLoaded(img).then(() => h("a", {href: url, target: "_blank"}, img));

    } else if ((m = /^https:\/\/itunes\.apple\.com\/(?:[a-z]{2}\/)?app\/id(\d+)/.exec(url)) !== null) {
        let iframe = h(`iframe`, {
            src: `https://widgets.itunes.apple.com/widget.html?c=us&brc=FFFFFF&blc=FFFFFF&trc=FFFFFF&tlc=FFFFFF&d=&t=&m=software&e=software,iPadSoftware&w=325&h=300&ids=${m[1]}&wt=discovery&partnerId=&affiliate_id=&at=&ct=`,
            frameborder: "0"
        });
        iframe.style.cssText = "overflow-x:hidden;overflow-y:hidden;width:325px;height: 300px;border:0px";
        return Promise.resolve(iframe);

    } else if ((m = /^https?:\/\/coub\.com\/view\/([^\/?#]+)/.exec(url)) !== null) {
        let id = m[1];
        return fetch(`https://davidmz.me/oembed/coub/oembed.json?url=${encodeURIComponent(url)}`)
            .then(resp => resp.json())
            .then(j => {
                var width = parseInt(j.width);
                var height = parseInt(j.height);
                if (width > 450) {
                    height = Math.round(height * 450 / width);
                    width = 450;
                }
                return h("div",
                    h("iframe", {
                        src: `https://coub.com/embed/${id}?muted=false&autostart=false&originalSize=false&hideTopBar=false&startWithHD=true`,
                        allowfullscreen: "true",
                        frameborder: "0",
                        style: `width: ${width}px; height: ${height}px;`
                    }),
                    h(`.be-fe-embed-byline`,
                        h("a", {href: url, target: "_blank"}, "View on COUB")
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

        return videoMetadataLoaded(video).then(() => wrapper);

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

        return videoMetadataLoaded(video).then(() => wrapper);

    } else if ((m = /^https?:\/\/t\.co\/.+$/.exec(url)) !== null) {
        return fetch(`https://davidmz.me/frfrfr/uinfo/unsokr?url=${encodeURIComponent(url)}`)
            .then(resp => resp.json())
            .then(j => {
                if (j.status != "ok") {
                    console.warn("Unsokr error:", j.msg, url);
                    throw new Error(j.msg);
                }
                return embedLink(j.data);
            })
            .catch(() => Promise.resolve(h("a.embedly-card", {href: url, "data-card-width": "60%"})));

    } else {
        return Promise.resolve(h("a.embedly-card", {href: url, "data-card-width": "60%"}));
    }
}


function videoMetadataLoaded(video) {
    return new Promise(resolve => video.addEventListener("loadedmetadata", () => resolve()));
}

export default embedLink;