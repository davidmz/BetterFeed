import forSelect from "../utils/for-select";
import h from "../utils/html";
import IAm from "../utils/i-am";
import userInfo from "../utils/user-info";

export default async function (node, settings) {
    node = node || document.body;

    var friendsLink = node.querySelector(".sidebar a[href$='/subscriptions']");
    if (!friendsLink) return;
    friendsLink.innerHTML = "Browse/edit friends and others";

    let iAm = await IAm.ready;

    if (location.pathname !== "/" + iAm.me + "/subscriptions") return;

    var boxBody = node.querySelector(".content .box-body");
    if (!boxBody || boxBody.querySelector(".be-fe-ban-list")) return;

    boxBody.appendChild(h("h3", "Blocked users"));
    if (iAm.banIds.length === 0) {
        boxBody.appendChild(h("p", "Nobody blocked. You are good person."));
        return;
    }

    let ul = boxBody.appendChild(h("ul.tile-list"));
    ul.style.marginBottom = "6em";

    try {
        let entries = await fetch(`https://davidmz.me/frfrfr/uinfo/usernamesByIDs/${iAm.banIds.join(",")}`)
            .then(resp => resp.json())
            .then(resp => {
                if (resp.status !== "ok") {
                    throw new Error(resp.msg);
                }
                return resp.data;
            });
        entries.forEach(async ({id, username}) => {
            if (!username) {
                console.warn(`Can not find username for ${id}`);
                return;
            }
            let uPic = h("img", {src: "/img/default-userpic-48.png"});
            let sName = document.createTextNode(username);
            ul.appendChild(h("li", h("a", {href: `/${username}`}, h(".avatar", uPic), sName)));
            let inf = await userInfo(username);
            let p = inf.users.profilePictureMediumUrl;
            if (p && p !== "") {
                uPic.src = p;
            }
            if (!settings.flag("fix-names")) {
                sName.nodeValue = inf.users.screenName;
            }
        })
    } catch (e) {
        console.warn(e);
    }
}


