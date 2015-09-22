import { authToken } from './current-user-id.js';

export function get(path) {
    return new Promise(function (resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', path);
        xhr.responseType = 'json';
        xhr.setRequestHeader('X-Authentication-Token', authToken);
        xhr.onload = function () {
            if (xhr.response && "err" in xhr.response) {
                reject(xhr.response.err);
            } else {
                resolve(xhr.response);
            }
        };
        xhr.send();
    });
}

export function put(path, body) {
    return new Promise(function (resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.open('PUT', path);
        xhr.responseType = 'json';
        xhr.setRequestHeader('X-Authentication-Token', authToken);
        xhr.onload = function () {
            if (xhr.response && "err" in xhr.response) {
                reject(xhr.response.err);
            } else {
                resolve(xhr.response);
            }
        };
        xhr.send(body);
    });
}

export function post(path, body) {
    return new Promise(function (resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.open('POST', path);
        xhr.responseType = 'json';
        xhr.setRequestHeader('X-Authentication-Token', authToken);
        xhr.onload = function () {
            if (xhr.response && "err" in xhr.response) {
                reject(xhr.response.err);
            } else {
                resolve(xhr.response);
            }
        };
        xhr.send(body);
    });
}
