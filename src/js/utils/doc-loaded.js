export default new Promise(function (resolve) {
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        setTimeout(resolve, 0);
    } else {
        document.addEventListener("DOMContentLoaded", resolve);
    }
});
