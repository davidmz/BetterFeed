import forSelect from "../utils/for-select";
import h from "../utils/html";

/**
 *
 * @param {HTMLElement|null} node
 * @param {Settings} settings
 */
export default function (node, settings) {
    if (!settings.flag("where-this-post-from")) return;

    node = node || document.body;

    settings.banComms.forEach(user => {
        forSelect(node, `.be-fe-comment-from-u-${user}:not(.be-fe-comment-hidden)`, node => {
            node.classList.add("be-fe-comment-hidden");
        });
    });
};