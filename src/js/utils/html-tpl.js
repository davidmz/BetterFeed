import escapeHTML from "./escape-html";

class SafeHTML {
    constructor(text) { this.text = text; }

    toString() { return this.text; }
}

export function safeHTML(text) { return new SafeHTML(text); }

export function isSafeHTML(h) { return (h instanceof SafeHTML); }

export function html(tpl, ...args) {
    return safeHTML(tpl.reduce((acc, part, i) => {
        let a = args[i - 1];
        return acc + (isSafeHTML(a) ? a : escapeHTML(a)) + part;
    }));
}