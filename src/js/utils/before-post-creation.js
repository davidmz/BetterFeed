import { userId }    from "../utils/current-user-id.js";
import Settings      from "../settings.js";
import closestParent from "../utils/closest-parent";
import matches       from "../utils/matches";

const settings = new Settings(userId);

var handlers = [];

document.addEventListener("click", function (e) {
    if (matches(e.target, ".p-create-post-action")) {
        let ta = closestParent(e.target, ".create-post").querySelector("textarea");
        handlers.forEach(h => h(ta));
    }
}, true);

document.addEventListener("keydown", function (e) {
    if (
        e.keyCode === 13
        && matches(e.target, ".p-create-post-view > textarea.ember-text-area")
        && (!settings.flag("new-lines") || !e.shiftKey)
    ) {
        let ta = e.target;
        handlers.forEach(h => h(ta));
    }
}, true);


export default function (handler) { handlers.push(handler); }
