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

var whoAmIReq = new Promise(function (resolve, reject) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', '/v1/users/whoami');
    xhr.responseType = 'json';
    xhr.setRequestHeader('X-Authentication-Token', localStorage["authToken"]);
    xhr.onload = function () {
        if ("err" in xhr.response) {
            reject(xhr.response.err);
            return;
        }
        var iAm = new IAm();
        iAm.me = xhr.response.users.username;
        iAm.friends = xhr.response.subscribers.map(function (it) { return it.username; });
        resolve(iAm);
    };
    xhr.send();
});

IAm.ready = whoAmIReq.then(function (iAm) {
    return new Promise(function (resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', '/v1/users/' + iAm.me + '/subscribers');
        xhr.responseType = 'json';
        xhr.setRequestHeader('X-Authentication-Token', localStorage["authToken"]);
        xhr.onload = function () {
            if ("err" in xhr.response) {
                reject(xhr.response.err);
                return;
            }
            iAm.readers = xhr.response.subscribers.map(function (it) { return it.username; });
            resolve(iAm);
        };
        xhr.send();
    });
});

module.exports = IAm;