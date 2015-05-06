/**
 * @param {Document|DocumentFragment|Element} node
 * @param {string} selector
 * @param {function(Node)} foo
 */
module.exports = function (node, selector, foo) {
    var nodes = node.querySelectorAll(selector);
    for (var i = 0, l = nodes.length; i < l; i++) {
        foo(nodes[i]);
    }
};
