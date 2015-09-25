const
    framesURL = require('url!../../../images/throbber-frames.png'),
    aniGifURL = "/img/throbber-16.gif",
    NFrames = 14,
    FrameSize = 16,
    isFirefox = /firefox/i.test(navigator.userAgent);

var
    inTransition = false,
    framesImage = null,
    staticURL = null,
    canvas = null,
    ctx = null,
    frame = 0,
    linkEl = null;

export default function (node) {
    if (node === undefined) {
        linkEl = document.querySelector("link[rel='icon']");
        staticURL = linkEl.getAttribute("href");
        if (!isFirefox) {
            framesImage = new Image;
            framesImage.addEventListener("load", () => {
                canvas = document.createElement("canvas");
                canvas.width = FrameSize;
                canvas.height = FrameSize;
                ctx = canvas.getContext('2d');
                setInterval(() => {
                    if (document.body.classList.contains('transition-active') !== inTransition) {
                        inTransition = !inTransition;
                        transitionState(inTransition);
                    }
                }, 250);
            });
            framesImage.src = framesURL;
        }

        if (document.body.classList.contains('transition-active') !== inTransition) {
            inTransition = !inTransition;
            transitionState(inTransition);
        }
        var observer = new MutationObserver(() => {
            if (document.body.classList.contains('transition-active') !== inTransition) {
                inTransition = !inTransition;
                transitionState(inTransition);
            }
        });
        observer.observe(document.body, {attributes: true, attributeFilter: ['class']});
    }
}

function transitionState(inTrans) {
    if (inTrans) {
        if (isFirefox) {
            linkEl.setAttribute("href", aniGifURL);
        } else {
            frame = 0;
            tick();
        }
    } else {
        linkEl.setAttribute("href", staticURL);
    }
}

function tick(t) {
    if (!inTransition) return;

    if (ctx) {
        ctx.clearRect(0, 0, FrameSize, FrameSize);
        ctx.drawImage(framesImage, 0, frame * FrameSize, FrameSize, FrameSize, 0, 0, FrameSize, FrameSize);
        linkEl.setAttribute("href", canvas.toDataURL());
        frame = (frame + 1) % NFrames;
    }

    setTimeout(tick, 120);
}
