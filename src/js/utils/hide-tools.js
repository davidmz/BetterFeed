import forSelect from "../utils/for-select";
import h from "../utils/html";
import docLoaded from "./doc-loaded";
import Settings from "../settings.js";

var style = null;

docLoaded.then(() => {
    style = document.head.appendChild(h("style.be-fe-banlist")).sheet;
});

export default class {
    /**
     * @param {Settings} settings
     */
    constructor(settings) {
        this.settings = settings;
        docLoaded.then(() => {
            for (let user of this.settings.banPosts) {
                style.insertRule(`.be-fe-post-from-u-${user} { display: none; }`, 0);
            }
        });
    }

    hidePostsFrom(user) {
        this.settings.banPosts.add(user);
        this.settings.save();
        style.insertRule(`.be-fe-post-from-u-${user} { display: none; }`, 0);
    }


    showPostsFrom(user) {
        this.settings.banPosts.delete(user);
        this.settings.save();
        const selector = `.be-fe-post-from-u-${user}`;
        Array.prototype.slice.call(style.rules).some((rule, n) => {
            if (rule.selectorText === selector) {
                style.deleteRule(n);
                return true;
            }
            return false;
        });
    }

    hideCommsFrom(user) {
        this.settings.banComms.add(user);
        this.settings.save();
        for (let u of this.settings.banComms) {
            forSelect(document.body, `.be-fe-comment-from-u-${u}:not(.be-fe-comment-hidden)`, node => {
                node.classList.add("be-fe-comment-hidden");
            });
        }
    }

    showCommsFrom(user) {
        this.settings.banComms.delete(user);
        this.settings.save();
        forSelect(document.body, `.be-fe-comment-from-u-${user}.be-fe-comment-hidden`, node => {
            node.classList.remove("be-fe-comment-hidden");
        });
    }
}

