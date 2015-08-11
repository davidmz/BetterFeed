var api = require("./api");
var uPics = require("./userpics");

function IAm() {
    this.me = null;
    this.myID = null;
    this.myScreenName = null;
    this.friends = [];
    this.readers = [];
    this.banIds = [];
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

IAm.prototype.isBanned = function (userId) {
    return (this.banIds.indexOf(userId) !== -1);
};

IAm.prototype.subscribed = function (username) {
    if (this.friends.indexOf(username) === -1) this.friends.push(username);
};

IAm.prototype.unsubscribed = function (username) {
    var p = this.friends.indexOf(username);
    if (p !== -1) this.friends.splice(p, 1);
};

IAm.prototype.blocked = function (userId) {
    if (this.banIds.indexOf(userId) === -1) this.banIds.push(userId);
};

IAm.prototype.unblocked = function (userId) {
    var p = this.banIds.indexOf(userId);
    if (p !== -1) this.banIds.splice(p, 1);
};

IAm.ready = null;

IAm.update = () => {
    IAm.ready = api.get('/v1/users/whoami').then(function (resp) {
        var iAm = new IAm();
        iAm.me = resp.users.username;
        iAm.myID = resp.users.id;
        iAm.myScreenName = resp.users.screenName;
        uPics.setPic(resp.users.username, resp.users.profilePictureMediumUrl);
        iAm.friends = resp.subscribers.map(function (it) {
            uPics.setPic(it.username, it.profilePictureMediumUrl);
            return it.username;
        });
        iAm.banIds = resp.users.banIds;

        return api.get('/v1/users/' + iAm.me + '/subscribers').then(function (resp) {
            iAm.readers = resp.subscribers.map(function (it) {
                uPics.setPic(it.username, it.profilePictureMediumUrl);
                return it.username;
            });
            return iAm;
        });
    });
};

IAm.update();

module.exports = IAm;
