import h from "../utils/html.js";
import closestParent from "../utils/closest-parent.js";

class Preloader {
    constructor() {
        this.image = h("img");
        this.cache = {};
        this.queue = [];

        this.image.addEventListener("load", () => this.moveQueue());
        this.image.addEventListener("error", () => this.moveQueue());
        this.moveQueue();
    }

    add(src) {
        if (src in this.cache) {
            return;
        }
        this.cache[src] = true;
        this.queue.push(src);
    }

    moveQueue() {
        var src = this.queue.pop();
        if (src !== undefined) {
            this.image.src = src;
        } else {
            setTimeout(() => this.moveQueue(), 250);
        }
    }
}


export default class SlideShow {

    constructor() {
        this.imageStab = "https://cdnjs.cloudflare.com/ajax/libs/galleriffic/2.0.1/css/loader.gif";
        this.lightBoxImage = h("img.light-box-img", {src: this.imageStab});
        this.lightBox = h(".frf-co-light-box.first.last.hidden",
            h(".light-box-shadow",
                h(".light-box-container", this.lightBoxImage),
                h(".light-box-arrow.left"),
                h(".light-box-arrow.right")
            )
        );

        /**
         * @type {DOMTokenList}
         */
        this.cList = this.lightBox.classList;
        this.preloader = new Preloader();
        this.hidden = true;
        this.slides = [];
        this.index = 0;

        document.body.appendChild(this.lightBox);

        document.body.addEventListener("keydown", (e) => {
            if (this.hidden) {
                return;
            }

            if (e.keyCode == 27) {
                this.hide();
            } else if (e.keyCode == 39) { // →
                this.next();
                e.preventDefault();
            } else if (e.keyCode == 37) { // ←
                this.prev();
                e.preventDefault();
            } else if (e.keyCode == 36) { // Home
                this.first();
                e.preventDefault();
            } else if (e.keyCode == 35) { // End
                this.last();
                e.preventDefault();
            }
        }, true);

        this.lightBox.addEventListener("click", (e) => {
            var arr;
            if ((arr = closestParent(e.target, ".light-box-arrow", true)) !== null) {
                e.stopPropagation();
                if (arr.classList.contains("left")) {
                    this.prev();
                } else if (arr.classList.contains("right")) {
                    this.next();
                }
            } else if (closestParent(e.target, ".light-box-shadow", true)) {
                this.hide();
            }
        });

        this.lightBoxImage.addEventListener("click", () => {
            window.open(this.slides[this.index].href, "_blank");
        });
    }

    isFirst() { return this.index === 0;}

    isLast() { return this.index === this.slides.length - 1;}

    /**
     * @param {Array<HTMLAnchorElement>} slides
     * @param {HTMLAnchorElement} currSlide
     */
    show(slides, currSlide) {
        this.slides = slides;
        slides.forEach((s, i) => {
            if (s === currSlide) {
                this.index = i;
            } else {
                this.preloader.add(s.dataset["imageSrc"]);
            }
        });
        this.hidden = false;
        this.cList.remove("hidden");
        this._showCurrent();
    }

    _showCurrent() {
        this.lightBoxImage.src = this.imageStab;
        this.lightBoxImage.src = this.slides[this.index].dataset["imageSrc"];
        this.lightBoxImage.style.cssText = ""; // fix for APNG
        if (this.isFirst()) this.cList.add("first"); else this.cList.remove("first");
        if (this.isLast()) this.cList.add("last"); else this.cList.remove("last");
    }

    hide() {
        if (!this.hidden) {
            this.hidden = true;
            this.cList.add("hidden");
        }
    }

    next() {
        if (this.hidden || this.isLast()) return;
        this.index++;
        this._showCurrent();
    }

    prev() {
        if (this.hidden || this.isFirst()) return;
        this.index--;
        this._showCurrent();
    }

    first() {
        if (this.hidden || this.isFirst()) return;
        this.index = 0;
        this._showCurrent();
    }

    last() {
        if (this.hidden || this.isLast()) return;
        this.index = this.slides.length - 1;
        this._showCurrent();
    }
}


