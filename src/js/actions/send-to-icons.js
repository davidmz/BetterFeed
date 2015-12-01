import forSelect from "../utils/for-select.js";
import IAm from "../utils/i-am.js";
import * as api from "../utils/api.js";
import userInfo from "../utils/user-info";
import Cell from "../utils/cell.js";

/**
 *
 * @param {HTMLElement|null} node
 * @param {Settings} settings
 */
export default function (node, settings) {
    node = node || document.body;

    forSelect(node, ".select2-results__option:not(.be-fe-fixed)", async node => {
        node.classList.add("be-fe-fixed");
        let userName = node.id.split("-").slice(4).join("-"),
            [{users: inf}, iAm] = await Promise.all([userInfo(userName), IAm.ready]),
            html;
        if (inf.username === iAm.me) {
            html = `<i class="fa fa-home"></i>`;
        } else if (inf.type === "user") {
            html = `<i class="fa fa-user"></i>`;
        } else {
            html = `<i class="fa fa-users"></i>`;
        }
        node.insertAdjacentHTML('afterbegin', html + " ");
    });


    forSelect(node, ".send-to", node => node.classList.add("be-fe-send-to"));

    const sel = node.querySelector("select.p-sendto-select");
    if (sel === null) {
        return;
    }

    // выбранные адресаты
    const selValues = new Cell(getSelected(sel));
    $(sel).on("change", () => selValues.value = getSelected(sel));

    selValues
        .map(names => Promise.all([IAm.ready, ...names.map(n => userInfo(n))]))
        .latestPromise()
        .onValue(infos => {
            if (infos === undefined) { // initial value
                return;
            }
            const iAm = infos.shift();
            infos
                .map(it => it.users)
                .forEach((inf, i) => {
                    let choices = forSelect(document.body, ".select2-selection__choice"),
                        choice = choices[i];
                    if (choice) {
                        let html;
                        if (inf.username === iAm.me) {
                            html = `<i class="fa fa-home"></i>`;
                        } else if (inf.type === "user") {
                            html = `<i class="fa fa-user"></i>`;
                        } else {
                            html = `<i class="fa fa-users"></i>`;
                        }
                        choice.insertAdjacentHTML('afterbegin', html + " ");
                    }
                });
        });
};

function getSelected(sel) {
    return Array.prototype.slice.call(sel.options).filter(it => it.selected).map(it => it.value);
}

