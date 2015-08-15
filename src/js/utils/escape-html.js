/**
 * @param {string} s
 * @return {string}
 */
module.exports = function (s) {
    return s.replace(/\&/g, "&amp;")
        .replace(/\</g, "&lt;").replace(/\>/g, "&gt;")
        .replace(/\"/g, "&quot;").replace(/\'/g, "&#x27;");
};
