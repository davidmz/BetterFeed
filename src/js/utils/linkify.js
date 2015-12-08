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
                let bText = linkingBeauty(it.text);
                let title = (bText !== it.text) ? it.text : "";
                let className = /^https?:\/\//i.test(it.text) ? "be-fe-url-with-proto" : "";
                return html`<a href="${it.url}" target="_blank" class="${className}" title="${title}">${bText}</a>`;
            } else if (it.type === "atLink") {
                return html`<a href="/${it.username}" class="be-fe-at-link be-fe-at-link-regular" data-username="${it.username}">${it.text}</a>`;
            } else if (it.type === "localLink") {
                let bText = linkingBeauty(it.text);
                let title = (bText !== it.text) ? it.text : "";
                return html`<a href="${it.uri}" title="${title}">${linkingBeauty(it.text)}</a>`;
            } else if (it.type === "email") {
                return html`<a href="mailto:${it.address}" target="_blank">${it.text}</a>`;
            } else {
                return html`${it.text}`;
            }
        })
        .join("").replace(/ title=""/g, "");
}

function linkingBeauty(href) {
    const MAX_LENGTH = 50;

    href = href.replace(/^https?:\/\//i, '');
    if (href.length <= MAX_LENGTH) return href;

    let [, host, path, query, hash] = /^([^\/]+)(?:\/([^#?]*))?(?:\?([^#]*))?(?:#(.*))?/i.exec(href);

    if (hash) {
        href = buildHref(host, path, query) + "#…";
        if (href.length <= MAX_LENGTH) return href;
    }

    if (query) {
        let parts = query.split("&");
        while (parts.length > 1) {
            parts.pop();
            href = buildHref(host, path, parts.join("&")) + "&…";
            if (href.length <= MAX_LENGTH) return href;
        }
        href = buildHref(host, path) + "?…";
        if (href.length <= MAX_LENGTH) return href;
    }

    if (path) {
        let parts = path.split("/");
        while (parts.length > 1) {
            parts.pop();
            href = buildHref(host, parts.join("/")) + "/…";
            if (href.length <= MAX_LENGTH) return href;
        }
        href = buildHref(host) + "/…";
    }

    return href;
}

function buildHref(host, path = "", query = "", hash = "") {
    return host
        + (path ? "/" + path : "")
        + (query ? "?" + query : "")
        + (hash ? "#" + hash : "");
}