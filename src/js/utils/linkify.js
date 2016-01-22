import {siteDomain} from "../utils/current-user-id";
import {html, safeHTML} from "../utils/html-tpl";
import URLFinder from "ff-url-finder";

const MAX_LENGTH = 40;

var finder = new URLFinder(
    ["ru", "com", "net", "org", "info", "gov", "edu", "рф", "ua"],
    (siteDomain === "freefeed.net") ? ["freefeed.net", "m.freefeed.net"] : ["micropeppa.freefeed.net"]
);

export default function (text) {
    return finder
        .parse(text)
        .map(it => {
            if (it.type === "link") {
                let bURL = URLFinder.shorten(it.text, MAX_LENGTH);
                let title = (bURL !== it.text) ? it.text : "";
                let [, proto, tail] = /^(https?:\/\/)?(.*)/i.exec(bURL);
                let className = proto ? "be-fe-url-with-proto" : "";
                return html`<a href="${it.url}" target="_blank" class="${className}" title="${title}"><span class="be-fe-link-proto">${proto}</span>${tail}</a>`;
            } else if (it.type === "atLink") {
                return html`<a href="/${it.username}" class="be-fe-at-link be-fe-at-link-regular" data-username="${it.username}">${it.text}</a>`;
            } else if (it.type === "localLink") {
                let bURL = URLFinder.shorten(it.text, MAX_LENGTH);
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