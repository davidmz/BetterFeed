var fixer = require("./fix-names");

module.exports = function (node, settings) {
    if (!settings["fix-names"]) {
        fixer(node, settings);
    }
};
