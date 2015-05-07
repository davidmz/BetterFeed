require('../../less/lightbox.less');
var SlideShow = require("../utils/slideshow");
var forSelect = require("../utils/for-select");
var closestParent = require("../utils/closest-parent");

// инициализация
var slideShow = new SlideShow();
document.body.addEventListener("click", function (e) {
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

module.exports = function (node) {
    node = node || document.body;

    forSelect(node, ".p-attachment-url:not(.light-box-thumbnail)", function (node) {
        if (node.dataset["imageSrc"]) {
            node.classList.add("light-box-thumbnail");

        } else if (/\.(jpe?g|png|gif)/i.test(node.href)) {
            node.dataset["imageSrc"] = node.href;
            node.classList.add("light-box-thumbnail");

        }
    });
};
