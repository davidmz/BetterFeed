export default function (node, settings) {
    if (node) return;

    let bg = settings.bgImage;
    if (/^https?:\/\//.test(bg)) {
        bg = bg.replace(/[(),'"\s\\]/g, a => `\\${a}`);
        document.body.style.backgroundImage = `url(${bg})`;
        document.body.classList.add("be-fe-with-bg");
    } else {
        let d = document.createElement("div");
        d.style.backgroundColor = bg;
        bg = d.style.backgroundColor;
        if (bg !== "") {
            document.body.style.backgroundColor = bg;
            document.body.classList.add("be-fe-with-bg");
        }
    }
}
