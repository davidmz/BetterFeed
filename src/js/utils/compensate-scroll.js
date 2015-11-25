export default function (node) {
    if (!node) return;

    let top = elemTop(node),
        currentHeight = node.offsetHeight,
        newHeight = node.firstChild.offsetHeight,
        halfScreen = Math.round(winHeight() / 2),
        scrollBy = 0;

    if (document.body.scrollTop > halfScreen / 2) { // если скролл хотя бы на 1/4 экрана
        if (top > halfScreen) {
            // nope
        } else if (top + currentHeight < halfScreen) {
            scrollBy = newHeight - currentHeight;
        } else {
            scrollBy = Math.round(newHeight * (halfScreen - top) / currentHeight);
        }
    }

    node.style.height = newHeight + "px";
    node.classList.add("-expanded");
    if (scrollBy !== 0) document.body.scrollTop += scrollBy;
}

function winHeight() { return (window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight); }

function elemTop(el) { return Math.round(el.getBoundingClientRect().top); }
