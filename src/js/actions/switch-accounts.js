import forSelect from "../utils/for-select";
import h from "../utils/html";

/**
 *
 * @param {HTMLElement|null} node
 * @param {Settings} settings
 */
export default function (node, settings) {
    node = node || document.body;

    forSelect(node, ".logged-avatar", node => {
        let switchLink = node.appendChild(h(".be-fe-switch-acc", {title: "Switch account"}, h("span.fa.fa-chevron-down")));
    });
}
