import { arrHas } from "./utils/array-set.js";

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

export const flagNames = [
    "alt-text-proc",
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
    "show-usernames",
    "direct-warning",
    "user-self-description",
    "switch-accounts",
    // "new-directs-track",
    "send-to-icons",
    "bg-image",
    "para-to-comments",
    "block-list",
    "empty-body",
    "decorate-quotes"
];

// Настройки, выключенные по умолчанию
const offNames = [
    "not-you"
];

export default class Settings {
    constructor(userId, sData) {
        if (sData !== undefined) {

            this.userId = sData.userId;
            this.flags = sData.flags;
            this.banPosts = sData.banPosts;
            this.banComms = sData.banComms;
            this.hideAlienPosts = sData.hideAlienPosts;
            this.directs = sData.directs;
            this.bgImage = sData.bgImage;

        } else {

            this.userId = userId;

            if (!localStorage.hasOwnProperty(LS_KEY) && localStorage.hasOwnProperty("ffc-sac-settings")) {

                this.flags = JSON.parse(localStorage["ffc-sac-settings"]);
                this.banPosts = safeJSONParse(localStorage["be-fe.banList"], []);
                this.banComms = safeJSONParse(localStorage["be-fe.banListComms"], []);
                this.hideAlienPosts = (localStorage["be-fe.hide-alien-posts"] === "1");
                this.directs = null; // initial value = null, else array
                this.bgImage = "";
                this.save();

            } else {

                let ss = safeJSONParse(localStorage[LS_KEY], {});
                let s = ss.hasOwnProperty(this.userId) ? ss[this.userId] : {};

                this.flags = s.hasOwnProperty("flags") ? s.flags : {};
                this.banPosts = s.hasOwnProperty("banPosts") ? s.banPosts : [];
                this.banComms = s.hasOwnProperty("banComms") ? s.banComms : [];
                this.hideAlienPosts = s.hasOwnProperty("hideAlienPosts") ? !!s.hideAlienPosts : false;
                this.directs = s.hasOwnProperty("directs") ? s.directs : null; // initial value = null, else array
                this.bgImage = s.hasOwnProperty("bgImage") ? s.bgImage : "";

            }
        }
    }

    /**
     *
     * @param {String} name
     * @return {Boolean}
     */
    flag(name) {
        if (!arrHas(flagNames, name)) return false;

        if (this.flags.hasOwnProperty(name)) {
            return this.flags[name];
        }

        return !arrHas(offNames, name);
    }

    /**
     *
     * @param {String} name
     * @param {Boolean} value
     */
    setFlag(name, value) {
        if (arrHas(flagNames, name)) {
            this.flags[name] = !!value;
        }
    }

    save() {
        let s = safeJSONParse(localStorage[LS_KEY], {});
        s[this.userId] = {
            flags: this.flags,
            banPosts: this.banPosts,
            banComms: this.banComms,
            hideAlienPosts: this.hideAlienPosts,
            directs: this.directs,
            bgImage: this.bgImage
        };
        localStorage[LS_KEY] = JSON.stringify(s);
    }

    exportData() {
        return {
            flags: this.flags,
            banPosts: this.banPosts,
            banComms: this.banComms,
            bgImage: this.bgImage
        };
    }

    importData(o) {
        this.flags = o.flags;
        this.banPosts = o.banPosts;
        this.banComms = o.banComms;
        this.bgImage = o.bgImage;
    }
}

function safeJSONParse(j, def) {
    try {
        return JSON.parse(j);
    } catch (e) {
        return def;
    }
}
