/**
 * @param {Set} s
 * @return {Array}
 */
export default function setToArray(s) {
    if (Array.from) return Array.from(s);
    var a = [];
    s.forEach(x => a.push(x));
    return a;
}

