import isArray from "./is-array";
import { isSafeHTML } from "./html-tpl";

/**
 * h("tag.class", {attr: val}, child)
 * h("tag.class", child)
 * h("tag.class", {attr: val})
 * h("tag.class")
 * h(".class") // div
 * h("$") // document fragment
 *
 * Класс, заданный через атрибуты, перекрывает классы из строки тегов
 *
 * @param {String} tagName - tag или tag.class1.class2 (поддерживаются только классы)
 * @param {Object} [attrs]
 * @param {Node|string|Array} [children]
 * @return {HTMLElement}
 */
export default function h(tagName, attrs, children) {
    var i, k;
    var tagParts = tagName.split(".");
    var tn = tagParts.shift() || "div";
    var el;
    if (tn === "$") {
        el = document.createDocumentFragment();
    } else {
        el = document.createElement(tn);
        if (tagParts.length > 0) {
            el.className = tagParts.join(" ");
        }
    }

    var chStart = 1;
    if (arguments.length > 1 && typeof attrs === "object" && !(attrs instanceof Node) && !isArray(attrs) && !isSafeHTML(attrs)) {
        for (k in attrs) if (attrs.hasOwnProperty(k)) el.setAttribute(k, attrs[k]);
        chStart = 2;
    }

    if (arguments.length > chStart) {
        for (i = chStart; i < arguments.length; i++) {
            append(el, arguments[i]);
        }
    }
    return el;
};

function append(el, it) {
    if (it instanceof Node) {
        el.appendChild(it);
    } else if (isArray(it)) {
        it.forEach(append.bind(null, el));
    } else if (typeof it === "string") {
        el.appendChild(document.createTextNode(it));
    } else if (isSafeHTML(it)) {
        el.insertAdjacentHTML('beforeEnd', it.toString())
    }
}