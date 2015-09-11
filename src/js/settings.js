import setToArray from "./utils/set-to-array.js";

/**
 * Структура настроек:
 * localStorage["bfSettings"] = {
 *      "user-id": {
 *          "flags": {"fix-names": true, …},
 *          …other settings
 *      }
 * };
 *
 */

const LS_KEY = "bfSettings";

export const flagNames = new Set([
    "fix-names",
    "lightboxed-images",
    "bottom-comment-link",
    "colored-comment-icons",
    "at-links",
    "comment-icons-click",
    "animated-gif",
    "where-this-post-from",
    "userpics-in-comments",
    "embed-ly",
    "hide-aliens",
    "hide",
    "user-info",
    "comment-counters",
    "new-lines",
    "fold-texts",
    "direct-style",
    "emoji",
    "not-you",
    "confirm-delete",
    "show-group-admins",
    "docs-preview",
    "hide-repeated-comments-icons",
    "datetime",
    "show-usernames"
]);

// Настройки, выключенные по умолчанию
const offNames = new Set([
    "not-you"
]);

export default class Settings {
    constructor(userId, sData) {
        if (sData !== undefined) {

            this.userId = sData.userId;
            this.flags = sData.flags;
            this.banPosts = sData.banPosts;
            this.banComms = sData.banComms;
            this.hideAlienPosts = sData.hideAlienPosts;

        } else {

            this.userId = userId;

            if (!localStorage.hasOwnProperty(LS_KEY) && localStorage.hasOwnProperty("ffc-sac-settings")) {

                this.flags = JSON.parse(localStorage["ffc-sac-settings"]);
                this.banPosts = new Set(safeJSONParse(localStorage["be-fe.banList"], []));
                this.banComms = new Set(safeJSONParse(localStorage["be-fe.banListComms"], []));
                this.hideAlienPosts = (localStorage["be-fe.hide-alien-posts"] === "1");
                this.save();

            } else {

                let ss = safeJSONParse(localStorage[LS_KEY], {});
                let s = ss.hasOwnProperty(this.userId) ? ss[this.userId] : {};

                this.flags = s.hasOwnProperty("flags") ? s.flags : {};
                this.banPosts = new Set(s.hasOwnProperty("banPosts") ? s.banPosts : []);
                this.banComms = new Set(s.hasOwnProperty("banComms") ? s.banComms : []);
                this.hideAlienPosts = s.hasOwnProperty("banComms") ? !!s.hideAlienPosts : false;

            }
        }
    }

    /**
     *
     * @param {String} name
     * @return {Boolean}
     */
    flag(name) {
        if (!flagNames.has(name)) return false;

        if (this.flags.hasOwnProperty(name)) {
            return this.flags[name];
        }

        return !offNames.has(name);
    }

    /**
     *
     * @param {String} name
     * @param {Boolean} value
     */
    setFlag(name, value) {
        if (flagNames.has(name)) {
            this.flags[name] = !!value;
        }
    }

    save() {
        let s = safeJSONParse(localStorage[LS_KEY], {});
        s[this.userId] = {
            flags: this.flags,
            banPosts: setToArray(this.banPosts),
            banComms: setToArray(this.banComms),
            hideAlienPosts: this.hideAlienPosts
        };
        localStorage[LS_KEY] = JSON.stringify(s);
    }
}

function safeJSONParse(j, def) {
    try {
        return JSON.parse(j);
    } catch (e) {
        return def;
    }
}
