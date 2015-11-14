import forSelect from "../utils/for-select";
import closestParent from "../utils/closest-parent";
import h from "../utils/html";
import { html, isSafeHTML } from "../utils/html-tpl";
import IAm from "../utils/i-am";
import * as api from "../utils/api";
import { siteDomain, cookieName, authToken } from '../utils/current-user-id';
import { defaultPic, getPic } from '../utils/userpics';
require('../../less/lightbox.less');

const ACC_LIST_KEY = `bfAccounts-${siteDomain}`;
const CSS_PREFIX = "be-fe-switch-dlg-";

/**
 *
 * @param {HTMLElement|null} node
 * @param {Settings} settings
 */
export default function (node, settings) {
    if (!node) init();

    node = node || document.body;

    forSelect(node, ".logged-avatar", node => {
        node.appendChild(
            h(".be-fe-switch-acc", {title: "Switch account"}, h("span.fa.fa-exchange"))
        ).addEventListener("click", showSwitchDialog);
    });
}

class LightBox {
    constructor(className) {
        this.elem = h(".light-box-content" + (className ? "." + className : ""));
        this.container = h(".light-box-container", this.elem);
        this.shadow = h(".light-box-shadow", this.container);
        this.base = h(".frf-co-light-box.hidden", this.shadow);

        this.shadow.addEventListener("click", e => {
            if (!closestParent(e.target, ".light-box-content")) {
                this.hide()
            }
        });
        document.body.appendChild(this.base);
    }

    show() { this.base.classList.remove("hidden"); }

    hide() { this.base.classList.add("hidden"); }

    set content(c) {
        if (isSafeHTML(c)) {
            this.elem.innerHTML = c.toString();
        } else {
            this.elem.innerHTML = "";
            this.elem.appendChild(c);
        }
    }
}

var lBox;
var clickHandlers = [
    {selector: `.${CSS_PREFIX}del`, handler: removeAccount},
    {selector: `.${CSS_PREFIX}account`, handler: accountClicked},
    {selector: `.${CSS_PREFIX}add-new`, handler: addAccountClicked}
];

function init() {
    document.body.addEventListener("click", e => {
        clickHandlers.some(h => {
            let t = closestParent(e.target, h.selector, true);
            if (t) {
                e.preventDefault();
                h.handler(t);
                return true;
            }
            return false;
        });
    });
}

async function showSwitchDialog() {
    if (!lBox) lBox = new LightBox("be-fe-switch-account-box");
    lBox.show();
    lBox.content = html`<p>Loading…</p>`;
    lBox.content = await genHtml();
}

async function genHtml() {
    let {me} = await IAm.ready;

    let form = h(`form.${CSS_PREFIX}new-form`,
        html`
        <p>Please enter username and password of your other account:</p>
        <p><input class="form-control" type="text" name="username" placeholder="Username" required></p>
        <p><input class="form-control" type="password" name="password" placeholder="Password" required></p>
        <p><button type="submit" class="btn btn-default">Add</button></p>
        `
    );
    form.addEventListener("submit", e => {
        e.preventDefault();
        let username = form.elements['username'].value;
        let password = form.elements['password'].value;
        (async () => {
            let d = await fetch("/v1/session", {
                method: "post",
                headers: {"Content-type": "application/x-www-form-urlencoded; charset=UTF-8"},
                body: `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`
            }).then(j => j.json());

            if (d.err) {
                alert(d.err);
                return;
            }
            //noinspection UnnecessaryLocalVariableJS
            let {users:{username: u}, authToken} = d;
            await addAccount(u, authToken);
            lBox.content = await genHtml();
        })();
    });

    return h("",
        html`<div class="${CSS_PREFIX}header">Switch account to:</div>`,
        h(
            `.${CSS_PREFIX}accounts`,
            (await readAccList()).map(
                ({username, current}) => {
                    let userPic = h(`img.${CSS_PREFIX}upic`, {src: defaultPic});
                    getPic(username).then(pic => userPic.src = pic);
                    let deleter = h(`.${CSS_PREFIX}del`, {title: "Remove from list"}, h("i.fa.fa-times-circle"));
                    return h(`.${CSS_PREFIX}account${(username == me) ? ".-current" : ""}`, {"data-username": username}, userPic, username, deleter);
                }
            )
        ),
        html`<div class="${CSS_PREFIX}add-new"><a><i class="fa fa-plus"></i> Add new account</a></div>`,
        form
    );
}

function addAccountClicked(el) {
    el.style.display = "none";
    document.body.querySelector(`.${CSS_PREFIX}new-form`).style.display = "block";
}

async function removeAccount(el) {
    let {me} = await IAm.ready;
    let username = closestParent(el, `.${CSS_PREFIX}account`).dataset['username'];
    if (username === me) return;
    if (!confirm("Are you sure?")) return;

    let list = (await readAccList()).filter(a => a.username !== username);
    if (list.length == 1 && list[0].username === me) {
        localStorage.removeItem(ACC_LIST_KEY);
    } else {
        localStorage[ACC_LIST_KEY] = JSON.stringify(list);
    }
    lBox.content = await genHtml();
}


async function accountClicked(el) {
    let username = el.dataset['username'];
    if (username === (await IAm.ready).me) return;
    let token = null;
    (await readAccList()).some(a => {
        if (a.username == username) {
            token = a.token;
            return true;
        }
        return false;
    });

    if (token) {
        lBox.hide();
        var d = new Date();
        d.setTime(d.getTime() + (365 * 24 * 60 * 60 * 1000));
        document.cookie = `${cookieName}=${encodeURIComponent(token)}; path=/; domain=.freefeed.net; expires=${d.toUTCString()}`;
        location.reload();
    }
}

async function readAccList() {
    try {
        let list = JSON.parse(localStorage[ACC_LIST_KEY]);
        if (!list) { //noinspection ExceptionCaughtLocallyJS
            throw new Error("Empty list");
        }
        return list;
    } catch (_) {
        return [{username: (await IAm.ready).me, token: authToken}];
    }
}

async function addAccount(username, token) {
    let list = await readAccList();
    if (list.some(a => a.username === username)) {
        return;
    }
    list.push({username, token});
    localStorage[ACC_LIST_KEY] = JSON.stringify(list);
}
