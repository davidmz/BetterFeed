/**
 * @param {string} s
 * @return {string}
 */
export default function (s = "") {
    return s.replace(/&/g, "&amp;")
        .replace(/</g, "&lt;").replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;").replace(/'/g, "&#x27;");
}
