import * as api from "../utils/api";

var userInfoDB = new Map();

export default function userInfo(name, refresh = false) {
    if (!userInfoDB.has(name) || refresh) {
        userInfoDB.set(name, api.get(`/v1/users/${name}`));
    }
    return userInfoDB.get(name);
}


