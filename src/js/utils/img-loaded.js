module.exports = function (img) {
    return new Promise(function (resolve, reject) {
        if (!img) return;
        if (img.complete) {
            setTimeout(resolve, 0);
        } else {
            img.addEventListener("load", resolve);
        }
    });
};
