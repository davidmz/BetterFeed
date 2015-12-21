export default class Cell {

    constructor(value) {
        this._value = value;
        this._listeners = new Set();
    }

    get value() { return this._value; }

    set value(v) {
        this._value = v;
        this.poke();
    }

    poke() {
        this._listeners.forEach(l => l(this._value));
    }

    onValue(lst) {
        this._listeners.add(lst);
        lst(this.value);
        return this;
    }

    unListen(lst) {
        this._listeners.delete(lst);
        return this;
    }

    /**
     * @param {function(Cell, *)} foo
     * @param {*} [initial]
     * @return {Cell}
     */
    derive(foo, initial) {
        var c = new Cell(initial);
        this.onValue(v => foo(c, v));
        return c;
    }

    /**
     * @param {Array.<Cell>} cells
     * @return {Cell}
     */
    static combine(...cells) {
        const cell = new Cell(cells.map(c => c.value));
        cells.forEach((c, i) => c.onValue(v => {
            let vv = cell.value;
            vv[i] = v;
            cell.value = vv;
        }));
        return cell;
    }

    map(foo) { return this.derive((c, v) => c.value = foo(v)); }

    filter(foo) { return this.derive((c, v) => foo(v) && (c.value = v)); }

    throttle(duration) {
        let val = undefined,
            timer = null;

        return this.derive((c, v) => {
            val = v;
            if (!timer) {
                timer = setTimeout(() => {
                    if (val !== undefined) {
                        c.value = this.value;
                        val = undefined;
                    }
                    timer = null;
                }, duration);
            }
        }, this.value);
    }

    /**
     * For cell with Promise's values
     * @param {*} [initial]
     * @return {Cell}
     */
    latestPromise(initial) {
        var lastProm = null;
        return this.derive((c, v) => {
            let prom = v;
            lastProm = prom;
            prom.then(res => {
                if (prom === lastProm) {
                    c.value = res;
                }
            });
        }, initial);
    }

    distinct() {
        var val;
        return this.derive((c, v) => {
            if (v !== val) {
                val = v;
                c.value = v;
            }
        });
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

        var getVal = () => (property === "self") ? input : input[property];

        var cell = new Cell(getVal());
        events.forEach(event => input.addEventListener(event, () => cell.value = getVal()));
        return cell;
    }

    static ticker(timeout) {
        let ticker = new Cell(true);
        setInterval(() => ticker.value = true, timeout);
        return ticker;
    }

}