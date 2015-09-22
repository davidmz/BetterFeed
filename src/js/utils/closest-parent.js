import matches from "./matches.js";

/**
 *
 * @param {Element} element
 * @param {string} selector
 * @param {boolean} [withSelf]
 * @return {Element|null}
 */
export default function closestParent(element, selector, withSelf = false) {
    var p = withSelf ? element : element.parentNode;
    if (p && p.nodeType == Node.ELEMENT_NODE) {
        return matches(p, selector) ? p : closestParent(p, selector);
    }
    return null;
};

