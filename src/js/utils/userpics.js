import * as api from './api.js';
import * as promPlus from './promise-tools.js';

export var defaultPic = "https://freefeed.net/img/default-userpic-48.png";
var picRegistry = {};

function picLoad(username) {
    return api.get("/v1/users/" + username).then(function (inf) {
        var p = inf.users.profilePictureMediumUrl;
        return (p && p !== "") ? p : defaultPic;
    });
}

export function getPic(username) {
    if (!(username in picRegistry)) {
        picRegistry[username] = picLoad(username);
    }
    return picRegistry[username];
}

export function setPic(username, pic) {
    picRegistry[username] = promPlus.resolve((pic && pic !== "") ? pic : defaultPic);
}
