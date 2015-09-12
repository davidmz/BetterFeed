export function arrAdd(arr, x) {
    if (!arrHas(arr, x)) {
        arr.push(x);
    }
}

export function arrDel(arr, x) {
    let p = arr.indexOf(x);
    if (p !== -1) {
        arr.splice(p, 1);
    }
}

export function arrHas(arr, x) {
    return (arr.indexOf(x) !== -1);
}

