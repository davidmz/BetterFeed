var api = require("./api");
var promPlus = require("./promise-tools");

var defaultPic = "https://freefeed.net/img/default-userpic-48.png";
var picRegistry = {};

function picLoad(username) {
    return api.get("/v1/users/" + username).then(function (inf) {
        var p = inf.users.profilePictureMediumUrl;
        return (p && p !== "") ? p : defaultPic;
    });
}

module.exports = {
    getPic: function (username) {
        if (!(username in picRegistry)) {
            picRegistry[username] = picLoad(username);
        }
        return picRegistry[username];
    },
    setPic: function (username, pic) {
        picRegistry[username] = promPlus.resolve((pic && pic !== "") ? pic : defaultPic);
    }
};