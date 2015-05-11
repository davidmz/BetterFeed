var api = require("./api");
var uPics = require("./userpics");

function IAm() {
    this.me = null;
    this.friends = [];
    this.readers = [];
}

IAm.ME = 1;
IAm.FRIEND = 2;
IAm.READER = 3;
IAm.STRANGER = 4;

IAm.prototype.whoIs = function (username) {
    if (username === this.me) {
        return IAm.ME;
    } else if (this.friends.indexOf(username) !== -1) {
        return IAm.FRIEND;
    } else if (this.readers.indexOf(username) !== -1) {
        return IAm.READER;
    } else {
        return IAm.STRANGER;
    }
};

IAm.ready = api.get('/v1/users/whoami').then(function (resp) {
    var iAm = new IAm();
    iAm.me = resp.users.username;
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