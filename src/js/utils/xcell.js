var versionCounter = 0;

export default class Cell {

    constructor(value, parents = []) {
        this.version = versionCounter;
        this.parents = parents;
        this.listeners = new Set();
        this.val = value;
        this.parents.forEach(p => p.onValue(this._listenToParent));
    }

    isScalar() {
        return this.parents.length === 0;
    }

    value() {
        return this.isScalar() ? this.val : this.parents.map(p => p.value());
    }

    set(value) {
        if (this.isScalar()) {
            this.val = value;
            this.version = ++versionCounter;
            this._updateListeners(value);
        } else {
            console.warn("Attempt to set value to non-scalar cell");
        }
        return this;
    }

    _listenToParent(_, ver) {
        if (ver > this.version) {
            this.version = ver;
            this._updateListeners(this.value());
        }
    }

    _updateListeners(value) {
        this.listeners.forEach(l => l(value, this.version));
    }

    onValue(lst) {
        this.listeners.add(lst);
        lst(this.value(), this.version);
        return this;
    }

    unListen(lst) {
        this.listeners.delete(lst);
        return this;
    }

    map(foo) {
        var c = new Cell();
        this.onValue(v => c.set(foo(v)));
        return c;
    }

    filter(foo) {
        var c = new Cell();
        this.onValue(v => foo(v) && c.set(v));
        return c;
    }

    distinct() {
        var c = new Cell(),
            val;
        this.onValue(v => {
            if (v !== val) {
                val = v;
                c.set(v);
            }
        });
        return c;
    }

    static fromInput(input, eventNames, property) {
        if (!input || !(input instanceof HTMLInputElement || input instanceof HTMLTextAreaElement || input instanceof HTMLSelectElement)) {
            return new Cell(null);
        }

        var defaultProperty = "value";
        if (input instanceof HTMLInputElement && (input.type === "checkbox" || input.type === "radio")) {
            defaultProperty = "checked";
        }

        var events = eventNames ? eventNames.split(" ") : ["input", "change"];
        property = property || defaultProperty;
        var cell = new Cell();
        var updateCell = () => cell.set((property === "self") ? input : input[property]);
        updateCell();
        for (let event of events) {
            input.addEventListener(event, updateCell);
        }
        return cell;
    }

}