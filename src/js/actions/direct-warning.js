import forSelect from "../utils/for-select.js";
import closestParent from "../utils/closest-parent.js";
import h from "../utils/html.js";
import IAm from "../utils/i-am.js";
import Cell from "../utils/cell.js";
import userInfo from "../utils/user-info";

/**
 *
 * @param {HTMLElement|null} node
 */
export default function (node) {
    node = node || document.body;

    const sel = node.querySelector("select.p-sendto-select");
    if (sel === null) {
        return;
    }


    const createView = closestParent(sel, ".p-timeline-post-create").querySelector(".p-create-post-view");
    const usersSpan = h("span"),
        feedsSpan = h("span"),
        thisFeesSpan = h("span"),
        warnDiv = h(
            ".alert.alert-warning.hidden",
            "You are going to send a direct message to ", usersSpan, ", but also chose ", feedsSpan, ".",
            "This means that everyone who reads ", thisFeesSpan, " will be able to read your message."
        );

    createView.parentNode.insertBefore(warnDiv, createView);

    // выбранные адресаты
    const selValues = new Cell(getSelected(sel));
    $(sel).on("change", () => selValues.value = getSelected(sel));

    const selParent = sel.parentNode;
    // видим ли селектор?
    const selVisible = new Cell(selParent.style.display !== "none");
    var observer = new MutationObserver(() => selVisible.value = selParent.style.display !== "none");
    observer.observe(selParent, {childList: true, attributes: true, attributeFilter: ['style']});

    Cell
        .combine(selValues, selVisible.distinct())
        .map(([vals, vis]) => vis ? vals : [])
        .map(names => Promise.all([IAm.ready, ...names.map(n => userInfo(n))]))
        .latestPromise()
        .onValue(infos => {
            if (infos === undefined) { // initial value
                return;
            }
            const iAm = infos.shift();
            var feeds = [],
                users = [];
            infos
                .map(it => it.users)
                .forEach(inf => {
                    var tgt = (inf.type === "user" && inf.username !== iAm.me) ? users : feeds;
                    tgt.push(inf.username);
                });

            if (users.length > 0 && feeds.length > 0) {
                thisFeesSpan.innerHTML = (feeds.length > 1) ? "these feeds" : "this feed";
                usersSpan.innerHTML = "";
                usersSpan.appendChild(names2html("user", "users", users));
                feedsSpan.innerHTML = "";
                feedsSpan.appendChild(names2html("feed", "feeds", feeds));
                warnDiv.classList.remove("hidden");
            } else {
                warnDiv.classList.add("hidden");
            }
        });
}

function getSelected(sel) {
    return Array.prototype.slice.call(sel.options).filter(it => it.selected).map(it => it.value);
}

function names2html(prefixOne, prefixMany, names) {
    var df = h("$", (names.length === 1) ? prefixOne : prefixMany, " ");
    var firstName = names.shift(), lastName = names.pop();
    df.appendChild(h("strong", firstName));
    names.forEach(name => df.appendChild(h("$", ", ", h("strong", name))));
    if (lastName) df.appendChild(h("$", " and ", h("strong", lastName)));
    return df;
}