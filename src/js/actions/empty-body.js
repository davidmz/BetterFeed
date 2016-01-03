import forSelect     from "../utils/for-select";
import Cell          from "../utils/cell";
import beforePost    from "../utils/before-post-creation";

var textArea = null,
    submitBtn = null,
    canPost = null;

export default function (node) {
    if (!node) {
        beforePost(ta => {
            if (!canPost.value) return;
            if (ta.value.replace(/\s+/, '') === '') {
                ta.value = ".";
                $(ta).change();
            }
        });

        let ticker = Cell.ticker(500),
            taEmpty = ticker.map(() => textArea ? textArea.value.replace(/\s+/, '') === '' : true).distinct(),
            hasAttaches = ticker.map(() => !!document.querySelector(".p-timeline-post-create .attachments")).distinct();

        canPost = Cell.combine(taEmpty, hasAttaches).map(([taEmpty, hasAttaches]) => hasAttaches || !taEmpty).distinct();

        canPost.onValue(can => {
            if (submitBtn) {
                submitBtn.disabled = !can
            }
        });
    }

    node = node || document.body;

    forSelect(node, ".p-timeline-post-create", node => {
        textArea = node.querySelector("textarea");
        submitBtn = node.querySelector(".p-create-post-action");
    });

    forSelect(node, ".timeline-post-container .text, .single-post-container .text", node => {
        if (node.textContent === ".") {
            node.style.display = "none";
        }
    });

}
