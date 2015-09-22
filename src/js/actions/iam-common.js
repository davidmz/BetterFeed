import forSelect from "../utils/for-select.js";
import IAm from "../utils/i-am.js";

export default function (node) {
    node = node || document.body;
    forSelect(node, ".p-settings-alert", () => IAm.update());
}

