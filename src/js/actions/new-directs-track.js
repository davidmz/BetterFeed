import forSelect from "../utils/for-select";
import h from "../utils/html";
import * as api from "../utils/api";
import { authToken } from '../utils/current-user-id';
import Cell from "../utils/cell";
import WS from "../utils/ws";

const MAX_POSTS_COUNT = 100;

var settings = null,
    initiateSettings,
    settingsInitiated = new Promise(resolve => initiateSettings = resolve),
    viewedPosts = null,
    actualPosts = new Map(),
    postsChanged = new Cell();

export default function (node, pSettings) {
    if (!settings) {
        settings = pSettings;
        if (settings.directs !== null) {
            initiateSettings();
        }
        viewedPosts = list2map(settings.directs || []);
    }

    if (!node) {
        init();

        postsChanged
            .map(() => {
                let hasNew = false,
                    hasUpdated = false;
                actualPosts.forEach((upd, id) => {
                    if (!viewedPosts.has(id)) {
                        hasNew = true;
                    } else if (viewedPosts.get(id) < upd) {
                        hasUpdated = true;
                    }
                });
                return [hasNew, hasUpdated];
            })
            .onValue(([hasNew, hasUpdated]) => {
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
        postsChanged.poke();
    });

    forSelect(node, ".direct-post", async node => {
        let postId = node.dataset.postId;
        if (!postId) return;
        await settingsInitiated;
        let {posts: {id, updatedAt}} = await api.get('/v1/posts/' + postId + '?maxLikes=0&maxComments=0');
        viewedPosts.set(id, parseInt(updatedAt));
        postsChanged.poke();
        settings.directs = map2list(viewedPosts);
        settings.save();
    });
}

function newPost(postId, updatedAt) {
    // Ждём 200 мс на случай, если пост будет рисоваться на странице
    setTimeout(() => {
        if (!document.getElementById(`post-${postId}`)) {
            // пост не на странице
            actualPosts.set(postId, updatedAt);
            postsChanged.poke();
        }
    }, 200);
}

function delPost(postId) {
    viewedPosts.delete(postId);
    actualPosts.delete(postId);
    postsChanged.poke();
    settings.directs = map2list(viewedPosts);
    settings.save();
}

function init() {
    let socket = new WS(`wss://${location.host}/socket.io/?token=${authToken}&EIO=3&transport=websocket`);
    socket.onConnect = async () => {
        let {posts, "timelines": {id}} = await api.get("/v1/timelines/filter/directs?offset=0");
        socket.send("42" + JSON.stringify(["subscribe", {timeline: [id]}]));
        if (settings.directs === null) {
            posts.forEach(p => viewedPosts.set(p.id, parseInt(p.updatedAt)));
            postsChanged.poke();
            settings.directs = map2list(viewedPosts);
            settings.save();
            initiateSettings();
        } else {
            posts.forEach(p => newPost(p.id, parseInt(p.updatedAt)));
        }
    };
    socket.onMessage = msg => {
        let [code] = /^\d+/.exec(msg);
        if (code != "42") return;
        let [event, obj] = JSON.parse(msg.substr(code.length));
        if (event == "comment:new") {
            newPost(obj.comments.postId, parseInt(obj.comments.createdAt));
        } else if (event == "post:new") {
            newPost(obj.posts.id, parseInt(obj.posts.createdAt));
        } else if (event == "post:destroy") {
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
    if (list.length > MAX_POSTS_COUNT) {
        list.sort((a, b) => b.updatedAt - a.updatedAt);
        list = list.slice(0, MAX_POSTS_COUNT);
    }
    return list;
}
