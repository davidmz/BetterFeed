/**
 * @param {Document|DocumentFragment|Element} node
 * @param {string} selector
 * @param {function(Node)} [foo]
 */
module.exports = function (node, selector, foo) {
    if (node === null) return [];
    var nodeList = node.querySelectorAll(selector);
    var nodes = nodeList ? Array.prototype.slice.call(nodeList) : [];
    if (node.matches(selector)) nodes.unshift(node);
    if (foo) {
        for (var i = 0, l = nodes.length; i < l; i++) {
            foo(nodes[i]);
        }
    }
    return nodes;
};
