import forSelect from "../utils/for-select";
import IAm from "../utils/i-am";
import * as api from "../utils/api";
import h from "../utils/html";
import Cell from "../utils/cell";
import { authToken, siteDomain } from '../utils/current-user-id';
import escapeHTML from '../utils/escape-html';

const atLinkRe = /^@([a-z0-9]+(?:-[a-z0-9]+)*)\b/i,
    threadID = (siteDomain == 'micropeppa.freefeed.net') ? "7a9cbbed-d9cb-4eca-aee4-b3dfeb0eac38" : "21284afb-6ffd-4b96-a4c3-a8663155627e",
    allTexts = new Map(); // username => Promise of description

const textsLoaded = async function () {
    try {
        let {comments, users} = await fetch(`/v1/posts/${threadID}?maxComments=all`).then(r => r.json());
        if (!comments) return;
        let id2username = new Map();
        allTexts.clear();
        users.forEach(u => id2username.set(u.id, u.username));
        comments.forEach(({createdBy, body}) => {
            let userName = id2username.get(createdBy);
            let prom;
            if (atLinkRe.test(body)) {
                let [, groupName] = atLinkRe.exec(body);
                let text = body.substr(groupName.length + 1).replace(/^\s+/, '');
                prom = checkAdmin(userName, groupName).then(() => text);
                userName = groupName;
            } else {
                prom = Promise.resolve(body);
            }
            let prevProm = textFor(userName);
            allTexts.set(userName, prom.catch(() => prevProm));
        });
    } catch (e) {
        console.warn(`Can not read descriptions feed ${threadID}:`, e);
    }
}();

async function checkAdmin(userName, groupName) {
    let {admins, users:{type}} = await api.get(`/v1/users/${groupName}`);
    if (!admins) throw new Error(`account ${groupName} not found`);
    if (type !== "group") throw new Error(`${groupName} is not group`);
    if (!admins.some(adm => adm.username == userName)) throw new Error(`${userName} not an admin of ${groupName}`);
    return true;
}

export default function (node) {
    if (!node) init();

    node = node || document.body;

    forSelect(node, ".p-settings-private", prvDiv => {
        let textArea = h("textarea.form-control", {id: "about-ta", maxlength: "500"});
        let taDiv = h("div",
            h("label", {for: "about-ta"}, "Description:"),
            textArea
        );
        prvDiv.parentNode.insertBefore(taDiv, prvDiv);

        (async () => {
            await textsLoaded;
            textArea.value = await textFor((await IAm.ready).me);
        })();

        document.body
            .querySelector(".p-settings-update")
            .addEventListener("click", () => setMyDescription(textArea.value).catch(e => alert(e)));
    });

    forSelect(node, ".p-update-settings-form", prevRow => {
        let [,,groupName] = location.pathname.split("/");
        let nextNode = prevRow.nextSibling;
        let textArea = h("textarea.form-control", {id: "about-ta", maxlength: "500"});
        let taDiv = h(".form-group",
            h("label", {for: "about-ta"}, "Description:"),
            textArea
        );
        nextNode.parentNode.insertBefore(taDiv, nextNode);

        (async () => {
            await textsLoaded;
            textArea.value = await textFor(groupName);
        })();

        document.body
            .querySelector(".p-update-settings-action")
            .addEventListener("click", () => setGroupDescription(groupName, textArea.value).catch(e => alert(e)));
    });
};

async function setMyDescription(text) {
    let {me, myID} = await IAm.ready;
    text = text.replace(/^\s+|\s+$/, '');

    let commentIDs = ((await fetch(`/v1/posts/${threadID}?maxComments=all`).then(r => r.json())).comments || [])
        .filter(({body, createdBy}) => (createdBy == myID && body.charAt(0) !== "@"))
        .map(({id}) => id);

    if (text === "") { // удаление
        commentIDs.forEach(id => api.del(`/v1/comments/${id}`, null));
    } else if (commentIDs.length > 0) {
        let lastCommentID = commentIDs[commentIDs.length - 1];
        api.put(`/v1/comments/${lastCommentID}`, JSON.stringify({comment: {body: text}}));
    } else {
        api.post(`/v1/comments`, JSON.stringify({comment: {body: text, postId: threadID}}));
    }
    allTexts.set(me, Promise.resolve(text));
}

async function setGroupDescription(groupName, text) {
    let {me, myID} = await IAm.ready;
    text = text.replace(/^\s+|\s+$/, '');

    await checkAdmin(me, groupName);

    let commentIDs = ((await fetch(`/v1/posts/${threadID}?maxComments=all`).then(r => r.json())).comments || [])
        .filter(({body, createdBy}) => (createdBy == myID && body.indexOf(`@${groupName} `) == 0))
        .map(({id}) => id);

    if (text === "") { // удаление
        commentIDs.forEach(id => api.del(`/v1/comments/${id}`, null));
    } else if (commentIDs.length > 0) {
        let lastCommentID = commentIDs[commentIDs.length - 1];
        api.put(`/v1/comments/${lastCommentID}`, JSON.stringify({comment: {body: `@${groupName} ${text}`}}));
    } else {
        api.post(`/v1/comments`, JSON.stringify({comment: {body: `@${groupName} ${text}`, postId: threadID}}));
    }
    allTexts.set(groupName, Promise.resolve(text));
}

async function init() {
    await textsLoaded;

    Cell
        .ticker(500)
        .map(() => !!document.body.querySelector(".p-user-profile") ? getLocationLogin() : null)
        .distinct()
        .onValue(() => {
            const desc = document.body.querySelector(".be-fe-self-desc");
            if (desc) desc.innerHTML = "";
        })
        .map(textFor)
        .latestPromise("")
        .onValue(text => {
            const profileDiv = document.body.querySelector(".p-user-profile");
            if (!profileDiv) return;
            const descCont = profileDiv.querySelector(".description");

            var descDiv = descCont.querySelector(".be-fe-self-desc");
            if (!descDiv) {
                descDiv = h(".be-fe-self-desc");
                descCont.appendChild(descDiv);
            }

            descDiv.innerHTML = formatText(text);
            linkify(descDiv);
        });
}

function textFor(login) { return allTexts.get(login) || Promise.resolve(""); }

function getLocationLogin() {
    let p = location.pathname.split("/");
    return (p.length > 1) ? p[1] : null;
}

function formatText(text) {
    text = text.replace(/^\s+|\s+$/, '');
    return text.split(/\n{2,}/)
        .map(text => text.split(/\n/).map(escapeHTML).join("<br>"))
        .map(html => `<p>${html}</p>`)
        .join('');
}

// from https://github.com/pepyatka/pepyatka-html/blob/development/public/js/libs/plugins/jquery.anchorlinks.js
function linkify(element) {
    $(element).linkify({
        format: function (value, type) {
            var url = value;
            var shorten = false;

            // shorten url if it's nested more than 2 levels, e.g. http://google.com/ab/cd
            var index = url.indexOf('://') > 0 ? 4 : 2;
            if (url.split('/').length > index &&
                    // does not shorten already tiny urls, like /a/b/
                !(url.split('/')[index].length == 1 && url.split('/').length == 5)) {
                url = url.split('/').slice(0, index).join('/');
                shorten = true;
            }

            // shorten url after ? symbol e.g. http://google.com/a?123
            if (url.split('?').length > 1 && url.split('?')[1].length > 2) {
                url = url.split('?')[0];
                shorten = true;
            }

            // shorten url after # symbol e.g. http://google.com/a#123
            if (url.split('#').length > 1 && url.split('#')[1].length > 2) {
                url = url.split('#')[0];
                shorten = true;
            }

            // shorten url if it's longer than 7 symbols e.g. http://google.com/12345678
            if (url.split('/').length == 4 &&
                url.split('/')[3].length > 7) {
                url = url.split('/').slice(0, 3).join('/') + '/' + url.split('/')[3].slice(0, 7);
                shorten = true;
            }

            if (shorten) {
                url = url + "\u2026";
            }

            return url;
        }
    });
}