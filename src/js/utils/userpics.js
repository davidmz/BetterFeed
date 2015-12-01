import userInfo from "../utils/user-info";

export var defaultPic = "https://freefeed.net/img/default-userpic-48.png";
var picRegistry = {};

async function picLoad(username) {
    let inf = await userInfo(username);
    let p = inf.users.profilePictureMediumUrl;
    return (p && p !== "") ? p : defaultPic;
}

export function getPic(username) {
    if (!(username in picRegistry)) {
        picRegistry[username] = picLoad(username);
    }
    return picRegistry[username];
}

export function setPic(username, pic) {
    picRegistry[username] = Promise.resolve((pic && pic !== "") ? pic : defaultPic);
}
