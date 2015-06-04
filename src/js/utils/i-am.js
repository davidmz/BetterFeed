var api = require("./api");
var uPics = require("./userpics");

function IAm() {
    this.me = null;
    this.myID = null;
    this.friends = [];
    this.readers = [];
}

IAm.ME = 1 << 0;
IAm.FRIEND = 1 << 1;
IAm.READER = 1 << 2;

IAm.prototype.whoIs = function (username) {
    var flags = 0;
    if (username === this.me) flags |= IAm.ME;
    if (this.friends.indexOf(username) !== -1) flags |= IAm.FRIEND;
    if (this.readers.indexOf(username) !== -1) flags |= IAm.READER;
    return flags;
};

IAm.prototype.subscribed = function (username) {
    if (this.friends.indexOf(username) === -1) this.friends.push(username);
};

IAm.prototype.unsubscribed = function (username) {
    var p = this.friends.indexOf(username);
    if (p !== -1) this.friends.splice(p, 1);
};

IAm.ready = api.get('/v1/users/whoami').then(function (resp) {
    var iAm = new IAm();
    iAm.me = resp.users.username;
    iAm.myID = resp.users.id;
    uPics.setPic(resp.users.username, resp.users.profilePictureMediumUrl);
    iAm.friends = resp.subscribers.map(function (it) {
        uPics.setPic(it.username, it.profilePictureMediumUrl);
        return it.username;
    });

    return api.get('/v1/users/' + iAm.me + '/subscribers').then(function (resp) {
        iAm.readers = resp.subscribers.map(function (it) {
            uPics.setPic(it.username, it.profilePictureMediumUrl);
            return it.username;
        });
        return iAm;
    });
});

module.exports = IAm;