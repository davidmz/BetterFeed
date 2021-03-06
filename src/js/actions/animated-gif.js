import forSelect from "../utils/for-select";
import imgLoaded from "../utils/img-loaded";

export default function (node, settings) {
    node = node || document.body;

    forSelect(node, "img.p-attachment-thumbnail[src$='.gif'][src*='/attachments/']:not(.be-fe-gif)", async img => {
        img.classList.add("be-fe-gif");
        try {
            await Promise.all([isAnimatedGif(img.src), imgLoaded(img)]);
            img.parentNode.classList.add("be-fe-gif-ani");
            drawImage(img);
        } catch (e) {
            // not an animated GIF
        }
    });
};

function drawImage(img) {
    if (img.src.match(/^data:/)) return;
    var c = document.createElement('canvas');
    var w = c.width = img.width;
    var h = c.height = img.height;

    var img2 = new Image();
    img2.crossOrigin = "anonymous";
    img2.onload = () => {
        c.getContext('2d').drawImage(img2, 0, 0, w, h);
        img.src = c.toDataURL();
    };
    img2.src = img.src;
}

// https://gist.github.com/marckubischta/261ad8427a214022890b
// (was https://gist.github.com/lakenen/3012623)
function isAnimatedGif(src) {
    return new Promise((resolve, reject) => {
        var request = new XMLHttpRequest();
        request.open('GET', src, true);
        request.responseType = 'arraybuffer';
        request.addEventListener('load', () => {
            var arr = new Uint8Array(request.response),
                i, len, length = arr.length, frames = 0;

            // make sure it's a gif (GIF8)
            if (arr[0] !== 0x47 || arr[1] !== 0x49 ||
                arr[2] !== 0x46 || arr[3] !== 0x38) {
                reject();
                return;
            }

            //ported from php http://www.php.net/manual/en/function.imagecreatefromgif.php#104473
            //an animated gif contains multiple "frames", with each frame having a
            //header made up of:
            // * a static 3-byte sequence (\x00\x21\xF9
            // * one byte indicating the length of the header (usually \x04)
            // * variable length header (usually 4 bytes)
            // * a static 2-byte sequence (\x00\x2C) (some variants may use \x00\x21 ?)
            // We read through the file as long as we haven't reached the end of the file
            // and we haven't yet found at least 2 frame headers
            for (i = 0, len = length - 3; i < len && frames < 2; ++i) {
                if (/* arr[i] === 0x00 && */ arr[i + 1] === 0x21 && arr[i + 2] === 0xF9) {
                    let blockLength = arr[i + 3],
                        afterBlock = i + 4 + blockLength;
                    if (afterBlock + 1 < length &&
                        arr[afterBlock] === 0x00 &&
                        (arr[afterBlock + 1] === 0x2C || arr[afterBlock + 1] === 0x21)) {
                        frames++;
                    }
                }
            }

            // if frame count > 1, it's animated
            ((frames > 1) ? resolve : reject)();
        });
        request.send();
    });
}