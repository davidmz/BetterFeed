import forSelect from "../utils/for-select.js";

export default function (node) {
    node = node || document.body;

    forSelect(node, "time", (node) => {
        var timeStamp = Date.parse(node.getAttribute("datetime"));
        if (Date.now() - timeStamp < 24 * 3600 * 1000) return;
        var s = format(timeStamp);
        if (node.firstChild) {
            node.setAttribute("title", s);
            node.innerHTML = s;
        } else {
            node.parentNode.setAttribute("title", s);
        }
    });
};

var mNames = "Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec".split(" ");

/**
 * @param {int} timeStamp
 * @return {string}
 */
function format(timeStamp) {
    var d = new Date(timeStamp);
    var t = pad(d.getHours()) + ":" + pad(d.getMinutes());
    var day = mNames[d.getMonth()] + " " + d.getDate();
    if (timeStamp < Date.now() - 100 * 24 * 3600 * 1000) {
        day += " " + d.getFullYear();
    }
    return day + ", " + t;
}

function pad(n, l = 2) {
    var s = n.toString();
    while (s.length < l) s = "0" + s;
    return s;
}