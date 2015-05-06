/**
 * h("tag.class", {attr: val}, child)
 * h("tag.class", child)
 * h("tag.class", {attr: val})
 * h("tag.class")
 * h(".class") // div
 *
 * Класс, заданный через атрибуты, перекрывает классы из строки тегов
 *
 * @param {String} tagName - tag или tag.class1.class2 (поддерживаются только классы)
 * @param {Object} [attrs]
 * @param {Node|string} [children]
 * @return {HTMLElement}
 */
module.exports = function (tagName, attrs, children) {
    var i, k;
    var tagParts = tagName.split(".");
    var tn = tagParts.shift() || "div";
    var el = document.createElement(tn);
    if (tagParts.length > 0) {
        el.className = tagParts.join(" ");
    }

    var chStart = 1;
    if (arguments.length > 1 && typeof attrs === "object" && !(attrs instanceof Node)) {
        for (k in attrs) if (attrs.hasOwnProperty(k)) el.setAttribute(k, attrs[k]);
        chStart = 2;
    }

    if (arguments.length > chStart) {
        for (i = chStart; i < arguments.length; i++) {
            var ch = arguments[i];
            if (ch instanceof Node) {
                el.appendChild(ch);
            } else if (typeof ch === "string") {
                el.appendChild(document.createTextNode(ch));
            }
        }
    }
    return el;
};