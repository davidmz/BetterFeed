import forSelect from "../utils/for-select";


export default function (node) {
    node = node || document.body;

    // id постов
    forSelect(node, ".timeline-post-container, .single-post-container", async (node) => {
        var pp = node.querySelector("a.datetime").getAttribute("href").match(/^\/.+?\/([\w-]+)/);
        if (!pp) return; // удивительный случай, когда у поста нет ID в HTML
        var postId = pp[1];
        node.id = `post-${postId}`;
        node.dataset.postId = postId;
    });
}