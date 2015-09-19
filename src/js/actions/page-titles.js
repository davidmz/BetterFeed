export default function (node) {
    if (node === undefined) {
        setInterval(tick, 1000);
    }
}

const
    spinner = '◐◓◑◒',
    spinnerRe = /^[◐◓◑◒] /;
var
    spinnerIndex = 0,
    inTransition = false,
    prevTitle = "";

function tick() {
    if (document.body.classList.contains('transition-active')) {
        let dt = document.title.replace(spinnerRe, '');
        if (!inTransition) {
            inTransition = true;
            dt = "freefeed";
        }
        document.title = spinner.charAt(spinnerIndex) + " " + dt;
        spinnerIndex = (spinnerIndex + 1) % spinner.length;
    } else {
        if (inTransition) {
            document.title = document.title.replace(spinnerRe, '');
        }
        spinnerIndex = 0;
        inTransition = false;
    }

    if (!inTransition) {
        let title = "";
        let prf = document.body.querySelector(".p-user-profile .description .name");
        if (prf) {
            title = trim(prf.textContent);
        }

        if (title === "") {
            let bht = document.body.querySelector(".box-header-timeline");
            if (bht) {
                let txt = "", c = bht.firstChild;
                while (c) {
                    if (c.nodeType === Node.TEXT_NODE) {
                        txt += c.nodeValue;
                    }
                    c = c.nextSibling;
                }

                title = trim(txt);
            }
        }

        if (title === "") {
            let spc = document.body.querySelector(".single-post-container");
            if (spc) {
                let postAuthor = spc.querySelector(".post-author").getAttribute("href").substr(1);
                let postBody = trim(spc.querySelector(".p-post-text").textContent.replace(/\s+/, ' '));
                if (postBody.length > 25) {
                    postBody = trim(postBody.substr(0, 25)) + "…";
                }
                title = `${postAuthor}: ${postBody}`;
            }
        }

        title = (title === "") ? "freefeed" : title + " \u00b7 freefeed";
        if (title !== prevTitle) {
            prevTitle = title;
            document.title = title;
        }
    }
}

function trim(txt) { return txt.replace(/^\s+|\s+$/, ''); }