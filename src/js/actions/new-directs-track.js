import forSelect from "../utils/for-select";
import h from "../utils/html";
import * as api from "../utils/api";
import { authToken } from '../utils/current-user-id';
import Cell from "../utils/cell";
import WS from "../utils/ws";

var settings = null;
var savedPosts = null;

var dirStatus = new Cell({hasNew: false, hasUpdated: false});

export default function (node, pSettings) {
    if (!settings) {
        settings = pSettings;
        savedPosts = list2map(settings.directs || []);
    }

    if (!node) {
        init();

        dirStatus.onValue(({hasNew, hasUpdated}) => {
            let el = document.body.querySelector(".be-fe-directs-notify");
            if (!el) return;
            if (hasNew) {
                el.classList.remove("hide");
                el.classList.add("-with-new");
                el.setAttribute("title", "New post(s)");
            } else if (hasUpdated) {
                el.classList.remove("hide");
                el.classList.remove("-with-new");
                el.setAttribute("title", "New comment(s)");
            } else {
                el.classList.add("hide");
            }
        });
    }

    node = node || document.body;

    forSelect(node, ".sidebar .p-direct-messages", node => {
        node.appendChild(h("i.fa.fa-envelope.be-fe-directs-notify.hide"));
        dirStatus.poke();
    });
}

function newPost(postId, updatedAt, doInsert = false) {
    if (!doInsert) {
        if (!savedPosts.has(postId)) {
            dirStatus.value = {...dirStatus.value, hasNew: true};
        } else if (updatedAt > savedPosts.get(postId)) {
            dirStatus.value = {...dirStatus.value, hasUpdated: true};
        }
    } else {
        savedPosts.set(postId, updatedAt);
    }
}

function delPost(postId) {
    // savedPosts.delete(postId);
}

function init() {
    let socket = new WS(`wss://${location.host}/socket.io/?token=${authToken}&EIO=3&transport=websocket`);
    socket.onConnect = async () => {
        let {posts, "timelines": {id}} = await api.get("/v1/timelines/filter/directs?offset=0");
        socket.send("42" + JSON.stringify(["subscribe", {timeline: [id]}]));
        let initialLoad = (settings.directs === null);
        posts.forEach(p => newPost(p.id, parseInt(p.updatedAt), initialLoad));
        if (initialLoad) {
            settings.directs = map2list(savedPosts);
            // settings.save();
        }
    };
    socket.onMessage = msg => {
        let [code] = /^\d+/.exec(msg);
        if (code != "42") return;
        let [event, obj] = JSON.parse(msg.substr(code.length));
        console.log(event, obj);
        if (event == "comment:new") {
            console.log(obj.comments.postId, obj.comments.createdAt);
            newPost(obj.comments.postId, parseInt(obj.comments.createdAt));
        } else if (event == "post:new") {
            console.log(obj.posts.id, obj.posts.createdAt);
            newPost(obj.posts.id, parseInt(obj.posts.createdAt));
        } else if (event == "post:destroy") {
            console.log(obj.meta.postId);
            delPost(obj.meta.postId);
        }
    };
}

function list2map(list) {
    let map = new Map();
    list.forEach(({id, updatedAt}) => map.set(id, updatedAt));
    return map;
}

function map2list(map) {
    let list = [];
    map.forEach((id, updatedAt) => list.push({id, updatedAt}));
    return list;
}
