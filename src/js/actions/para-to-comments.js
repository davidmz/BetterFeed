import forSelect     from "../utils/for-select";
import closestParent from "../utils/closest-parent";
import matches       from "../utils/matches";
import * as api      from "../utils/api";
import h             from "../utils/html";
import Cell          from "../utils/cell";

var tasks = new Map(),
    checkboxCont = null,
    checkbox = null,
    textArea = null;

export default function (node, settings) {
    if (node === undefined) {
        document.addEventListener("keydown", function (e) {
            if (
                e.keyCode === 13
                && matches(e.target, ".p-create-post-view > textarea.ember-text-area")
                && (!settings.flag("new-lines") || !e.shiftKey)
            ) {
                onPost(e.target);
            }
        }, true);

        document.addEventListener("click", function (e) {
            if (matches(e.target, ".p-create-post-action")) {
                let form = closestParent(e.target, ".create-post");
                onPost(form.querySelector("textarea"));
            }
        }, true);
    }

    Cell
        .ticker(500)
        .map(() => textArea ? textArea.value : "")
        .map(val => val.replace(/^\s+|\s+$/, '').split(/\n{2,}/).length > 1)
        .distinct()
        .onValue(f => {
            if (checkboxCont) {
                checkboxCont.style.display = f ? "block" : "none";
            }
        });

    node = node || document.body;

    forSelect(node, ".p-timeline-post-create:not(.be-fe-p2c)", node => {
        node.classList.add("be-fe-p2c");
        let row = node.querySelector(":scope > .row"),
            divs = forSelect(row, ":scope > div", d => d.className = "col-md-6");
        textArea = node.querySelector("textarea");
        checkbox = h("input", {type: "checkbox"});
        checkboxCont = divs[1].appendChild(h(".pull-right.be-fe-p2c-cont", checkbox, " paragraphs as comments"));
    });

    forSelect(node, ".timeline-post-container", node => {
        let postId = node.dataset["postId"],
            postBody = node.querySelector(".body"),
            bodyText = postBody.textContent;
        let m = /==bft(\w+)==/.exec(bodyText);
        if (m && tasks.has(m[1])) {
            let comments = tasks.get(m[1]);
            forTexts(postBody, text => text.replace(/==bft(\w+)==/, ''));

            (async() => {
                let {posts: post} = await api.get(`/v1/posts/${postId}`);
                post.body = post.body.replace(/==bft(\w+)==/, '');
                api.put(`/v1/posts/${postId}`, JSON.stringify({
                    meta: {},
                    post: {
                        body: post.body,
                        attachments: post.attachments || []
                    }
                }));
            })();

            (async() => {
                for (let i = 0; i < comments.length; i++) {
                    await api.post("/v1/comments", JSON.stringify({comment: {body: comments[i], postId: postId}}));
                }
            })();
        }
    });
}

/**
 *
 * @param {HTMLTextAreaElement|Element} ta
 */
function onPost(ta) {
    let paras = ta.value.replace(/^\s+|\s+$/, '').split(/\n{2,}/);
    if (paras.length > 1 && checkbox.checked) {
        let taskId = randomId();
        tasks.set(taskId, paras.slice(1));
        ta.value = paras[0] + `==bft${taskId}==`;
        $(ta).change();
    }

    setTimeout(() => {
        var evt = document.createEvent('Event');
        evt.initEvent('autosize:update', true, false);
        ta.dispatchEvent(evt);

        checkbox.checked = false;
        checkboxCont.style.display = "none";
    }, 250);
}

/**
 *
 * @return {string}
 */
function randomId() {
    return Math.random().toString(36).slice(2);
}

/**
 *
 * @param {HTMLElement} elem
 * @param {function(string):string} foo
 */
function forTexts(elem, foo) {
    var c = elem.firstChild;
    while (c) {
        if (c.nodeType == Node.TEXT_NODE) {
            c.nodeValue = foo(c.nodeValue);
        } else if (c.nodeType == Node.ELEMENT_NODE) {
            forTexts(c, foo);
        }
        c = c.nextSibling;
    }
}