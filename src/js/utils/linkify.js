import {siteDomain} from "../utils/current-user-id";
import {html, safeHTML} from "../utils/html-tpl";
import URLFinder from "ff-url-finder";

var finder = new URLFinder(
    ["ru", "com", "net", "org", "info", "gov", "edu", "рф", "ua"],
    (siteDomain === "freefeed.net") ? ["freefeed.net", "m.freefeed.net"] : ["micropeppa.freefeed.net"]
);

export default function (text) {
    return finder
        .parse(text)
        .map(it => {
            if (it.type === "link") {
                let bURL = linkingBeauty(it.text);
                let title = (bURL !== it.text) ? it.text : "";
                let [, proto, tail] = /^(https?:\/\/)?(.*)/i.exec(bURL);
                let className = proto ? "be-fe-url-with-proto" : "";
                return html`<a href="${it.url}" target="_blank" class="${className}" title="${title}"><span class="be-fe-link-proto">${proto}</span>${tail}</a>`;
            } else if (it.type === "atLink") {
                return html`<a href="/${it.username}" class="be-fe-at-link be-fe-at-link-regular" data-username="${it.username}">${it.text}</a>`;
            } else if (it.type === "localLink") {
                let bURL = linkingBeauty(it.text);
                let title = (bURL !== it.text) ? it.text : "";
                let [, proto, tail] = /^(https?:\/\/)?(.*)/i.exec(bURL);
                return html`<a href="${it.uri}" title="${title}"><span class="be-fe-link-proto">${proto}</span>${tail}</a>`;
            } else if (it.type === "email") {
                return html`<a href="mailto:${it.address}" target="_blank">${it.text}</a>`;
            } else {
                return html`${it.text}`;
            }
        })
        .join("").replace(/ title=""/g, "");
}

function linkingBeauty(url) {
    const MAX_LENGTH = 50;

    let [, proto, host, path, query, hash] = /^(https?:\/\/)?([^\/]+)(?:\/([^#?]*))?(?:\?([^#]*))?(?:#(.*))?/i.exec(url);
    if (!proto) proto = "";

    let href = buildHref(host, path, query, hash);
    if (href.length <= MAX_LENGTH) return proto + href;

    if (hash) {
        href = buildHref(host, path, query) + "#…";
        if (href.length <= MAX_LENGTH) return proto + href;
    }

    if (query) {
        let parts = query.split("&");
        while (parts.length > 1) {
            parts.pop();
            href = buildHref(host, path, parts.join("&")) + "&…";
            if (href.length <= MAX_LENGTH) return proto + href;
        }
        href = buildHref(host, path) + "?…";
        if (href.length <= MAX_LENGTH) return proto + href;
    }

    if (path) {
        let parts = path.split("/");
        while (parts.length > 1) {
            parts.pop();
            href = buildHref(host, parts.join("/")) + "/…";
            if (href.length <= MAX_LENGTH) return proto + href;
        }
        href = buildHref(host) + "/…";
    }

    return proto + href;
}

function buildHref(host, path = "", query = "", hash = "") {
    return host
        + (path ? "/" + path : "")
        + (query ? "?" + query : "")
        + (hash ? "#" + hash : "");
}