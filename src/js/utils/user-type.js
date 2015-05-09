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
        var res = {
            me: xhr.response.users.username,
            friends: xhr.response.subscribers.map(function (it) { return it.username; })
        };
        resolve(res);
    };
    xhr.send();
});

var withReaders = whoAmIReq.then(function (inf) {
    return new Promise(function (resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', '/v1/users/' + inf.me + '/subscribers');
        xhr.responseType = 'json';
        xhr.setRequestHeader('X-Authentication-Token', localStorage["authToken"]);
        xhr.onload = function () {
            if ("err" in xhr.response) {
                reject(xhr.response.err);
                return;
            }
            inf.readers = xhr.response.subscribers.map(function (it) { return it.username; });
            resolve(inf);
        };
        xhr.send();
    });
});

var UserType = {
    ME: 1,
    FRIEND: 2,
    READER: 3,
    STRANGER: 4,

    whoIs: function (username) {
        return withReaders.then(function (inf) {
            if (username === inf.me) {
                return UserType.ME;
            } else if (inf.friends.indexOf(username) !== -1) {
                return UserType.FRIEND;
            } else if (inf.readers.indexOf(username) !== -1) {
                return UserType.READER;
            } else {
                return UserType.STRANGER;
            }
        });
    }
};

module.exports = UserType;