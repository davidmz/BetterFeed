import forSelect from "../utils/for-select";
import IAm from "../utils/i-am";
import * as api from "../utils/api";
import h from "../utils/html";
import Cell from "../utils/cell";
import { authToken, siteDomain } from '../utils/current-user-id';
import escapeHTML from '../utils/escape-html';
import userInfo from "../utils/user-info";
import linkify from "../utils/linkify";

const atLinkRe = /^@([a-z0-9]+(?:-[a-z0-9]+)*)\b/i,
    threadID = (siteDomain == 'micropeppa.freefeed.net') ? "7a9cbbed-d9cb-4eca-aee4-b3dfeb0eac38" : "21284afb-6ffd-4b96-a4c3-a8663155627e",
    allTexts = new Map(), // username => Promise of description
    groupAdmins = new Map(); // [groupname, username] => true

const textsLoaded = async function () {
    try {
        let {comments, users} = await api.get(`/v1/posts/${threadID}?maxComments=all`);
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
    let {admins, users:{type}} = await userInfo(groupName);
    if (!admins) throw new Error(`account ${groupName} not found`);
    if (type !== "group") throw new Error(`${groupName} is not group`);
    if (!admins.some(adm => adm.username == userName)) throw new Error(`${userName} not an admin of ${groupName}`);
    groupAdmins.set([groupName, userName], true);
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
    let {myID} = await IAm.ready;
    text = text.replace(/^\s+|\s+$/, '');
    await api.put(`/v1/users/${myID}`, JSON.stringify({user: {description: text}}));
    clearLocalMyDescription();
}

async function clearLocalMyDescription() {
    let {me, myID} = await IAm.ready;
    // удаляем все комментарии
    ((await api.get(`/v1/posts/${threadID}?maxComments=all`)).comments || [])
        .filter(({body, createdBy}) => (createdBy == myID && body.charAt(0) !== "@"))
        .map(({id}) => id)
        .forEach(id => api.del(`/v1/comments/${id}`, null));

    allTexts.delete(me);
    userInfo(me, true)
}

async function setGroupDescription(groupName, text) {
    let {me} = await IAm.ready;
    text = text.replace(/^\s+|\s+$/, '');

    await checkAdmin(me, groupName);
    let {users:{id: groupId}} = await userInfo(groupName);

    await api.put(`/v1/users/${groupId}`, JSON.stringify({user: {description: text}}));
    clearLocalGroupDescription(groupName);
}

async function clearLocalGroupDescription(groupName) {
    let {myID} = await IAm.ready;
    // удаляем все комментарии
    ((await api.get(`/v1/posts/${threadID}?maxComments=all`)).comments || [])
        .filter(({body, createdBy}) => (createdBy == myID && body.indexOf(`@${groupName} `) == 0))
        .map(({id}) => id)
        .forEach(id => api.del(`/v1/comments/${id}`, null));

    allTexts.delete(groupName);
    userInfo(groupName, true)
}

async function updateMyStaff() {
    // Если надо, обновляем своё описание и описания групп
    let {me} = await IAm.ready;
    let myGroups = Array.from(groupAdmins.keys()).filter(([, u]) => u === me).map(([g, ]) => g);

    let localDesc = allTexts.get(me);
    let {users: {description: srvDesc}} = await userInfo(me);
    if (localDesc) {
        if (!srvDesc) {
            let text = await localDesc;
            setMyDescription(text);
        } else {
            clearLocalMyDescription();
        }
    }

    myGroups.forEach(async g => {
        let localDesc = allTexts.get(g);
        let {users: {description: srvDesc}} = await userInfo(g);
        if (localDesc) {
            if (!srvDesc) {
                let text = await localDesc;
                setGroupDescription(g, text);
            } else {
                clearLocalGroupDescription(g);
            }
        }
    });
}


async function init() {
    await textsLoaded;

    updateMyStaff();

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

            descDiv.innerHTML = breakToLines(linkify(text));
            linkify(descDiv);
        });
}

async function textFor(login) {
    let {users: {description}} = await userInfo(login);
    return description || allTexts.get(login) || "";
}

function getLocationLogin() {
    let p = location.pathname.split("/");
    return (p.length > 1) ? p[1] : null;
}

function breakToLines(text) {
    text = text.replace(/^\s+|\s+$/, '');
    return text.split(/\n{2,}/)
        .map(text => text.split(/\n/).join("<br>"))
        .map(html => `<p>${html}</p>`)
        .join('');
}

