import isArray from "./is-array.js";

export default class {

    constructor(name) {
        this.name = name;
    }

    get() {
        var list;
        try {
            list = JSON.parse(localStorage[this.name]);
        } catch (e) {
            list = [];
        }
        if (!isArray(list)) list = [];
        return list;
    }

    set(list) {
        localStorage[this.name] = JSON.stringify(list);
    }

    add(user) {
        var list = this.get();
        if (list.indexOf(user) === -1) list.push(user);
        this.set(list);
    }

    remove(user) {
        var list = this.get();
        var p = list.indexOf(user);
        if (p !== -1) list.splice(p, 1);
        this.set(list);
    }

    contains(user) {
        return (this.get().indexOf(user) !== -1);
    }
}
