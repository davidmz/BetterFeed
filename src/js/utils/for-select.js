/**
 * @param {Document|DocumentFragment|Element} node
 * @param {string} selector
 * @param {function(Node)} [foo]
 */
module.exports = function (node, selector, foo) {
    if (node === null) return [];
    var nodes = Array.prototype.slice.call(node.querySelectorAll(selector));
    if (foo) {
        for (var i = 0, l = nodes.length; i < l; i++) {
            foo(nodes[i]);
        }
    }
    return nodes;
};
