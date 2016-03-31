import forSelect from "../utils/for-select";
import h from "../utils/html";

export default function (node = document.body) {
    forSelect(node, ".box-header-groups", node => {
        if (node.textContent.replace(/^\s+|\s+$/g, '') === "Groups") {
            node.appendChild(h("a.box-header-right", {
                target: "_blank",
                href: "https://davidmz.me/frfrfr/all-groups/"
            }, "Show all"));
        }
    });
}