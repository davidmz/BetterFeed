import forSelect from "../utils/for-select.js";
import h from "../utils/html.js";
require('../../less/comments-icons.less');

export default function (node) {
    node = node || document.body;

    forSelect(node, ".comment .date:not(.be-fe-iconized)", function (node) {
        node.classList.add("be-fe-iconized");
        node.appendChild(h("i.fa.fa-comment.icon.be-fe-ico-bg"));
    });
}

