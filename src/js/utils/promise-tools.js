/**
 *
 * @param {Array<Promise>} promises
 * @return Promise
 */
export function all(promises) {
    var nRemains = promises.length;
    var results = new Array(promises.length);
    return new Promise(function (resolve, reject) {
        promises.forEach(function (p, i) {
            p.then(
                function (r) {
                    results[i] = r;
                    nRemains--;
                    if (nRemains === 0) resolve(results);
                },
                function (err) {
                    reject(err);
                }
            );
        });
    });
}

export function resolve(value) {
    return new Promise(function (resolve, reject) { resolve(value); });
}

