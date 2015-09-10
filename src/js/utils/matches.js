const matchesMethod = ("matches" in HTMLElement.prototype) ? "matches" : "msMatchesSelector";

/**
 *
 * @param {HTMLElement} node
 * @param {String} selector
 * @return {Boolean}
 */
export default function (node, selector) { return node[matchesMethod](selector); }

