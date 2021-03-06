import SlideShow from "../utils/slideshow.js";
import forSelect from "../utils/for-select.js";
import closestParent from "../utils/closest-parent.js";
require('../../less/lightbox.less');

// инициализация
var slideShow = new SlideShow();

document.body.addEventListener("click", (e) => {
    var th = closestParent(e.target, ".light-box-thumbnail", true);
    if (!th || e.button != 0) return;
    e.preventDefault();

    // соседи
    var slides = [th];
    var cont = closestParent(th, ".attachments");
    if (cont) {
        slides = forSelect(cont, ".light-box-thumbnail");
    }
    slideShow.show(slides, th);
}, false);

module.exports = (node) => {
    node = node || document.body;

    forSelect(node, ".p-attachment-url:not(.light-box-thumbnail)", (node) => {
        if (node.dataset["imageSrc"]) {
            node.classList.add("light-box-thumbnail");

        } else if (/\.(jpe?g|png|gif)/i.test(node.href)) {
            node.dataset["imageSrc"] = node.href;
            node.classList.add("light-box-thumbnail");

        }
    });
};
