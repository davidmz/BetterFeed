import forSelect from "../utils/for-select.js";
import h from "../utils/html.js";

export default function (node) {
    node = node || document.body;

    forSelect(node, ".p-comment-delete, .p-post-destroy, .p-timeline-post-destroy-action", function (origLink) {
        if (origLink.classList.contains("be-fe-confirm-hidden")) {
            return;
        }
        origLink.classList.add("be-fe-confirm-hidden");

        var timer = null,
            trigger = h("a", origLink.innerHTML),
            confirm = h("a", "Yes, delete!"),
            cancel = h("a", "Cancel"),
            wrapper = h("span.be-fe-confirm-wrapper",
                trigger,
                h(".be-fe-confirm-win", confirm, " \u2022 ", cancel)
            );

        origLink.parentNode.insertBefore(wrapper, origLink);

        trigger.addEventListener("click", function () {
            wrapper.classList.add("be-fe-confirm-wrapper--show");
            timer = window.setTimeout(function () {
                wrapper.classList.remove("be-fe-confirm-wrapper--show");
                timer = null;
            }, 5000);
        });

        cancel.addEventListener("click", function () {
            wrapper.classList.remove("be-fe-confirm-wrapper--show");
            window.clearTimeout(timer);
        });

        confirm.addEventListener("click", function () {
            window.clearTimeout(timer);
            $(origLink).click();
        });
    });
}