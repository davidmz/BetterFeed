import forSelect from "../utils/for-select.js";
import h from "../utils/html.js";
import closestParent from "../utils/closest-parent.js";

export default function (node) {
    node = node || document.body;

    forSelect(node, ".p-timeline-post-comment-action:not(.be-fe-copied)", function (node) {
        node.classList.add("be-fe-copied");
        var post = closestParent(node, ".post-body");
        if (!post) return;

        if (post.querySelector(".add-comment-block")) return;

        var emberAction = {"data-ember-action": node.getAttribute("data-ember-action")};
        var cont = h(".add-comment-block.be-fe-add-comment-block",
            h("a.fa-stack.fa-1x", emberAction,
                h("i.fa.fa-comment-o fa-stack-1x"),
                h("i.fa.fa-square.fa-inverse.fa-stack-1x"),
                h("i.fa.fa-plus.fa-stack-1x")
            ),
            h("a.add-comment-link", emberAction, "Add comment")
        );
        post.querySelector(".comments").appendChild(cont);
    });
}

