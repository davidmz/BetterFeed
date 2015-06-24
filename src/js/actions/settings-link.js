var h = require("../utils/html");
require('../../less/lightbox.less');

/** @type {Element} */
var lightBoxCont = h(".light-box-container.be-fe-settingsLB");
var lightBox = h(".frf-co-light-box.hidden", h(".light-box-shadow", lightBoxCont));

var startVersion = localStorage['be-fe-version'];

setInterval(function () {
    var setBlock = document.querySelector(".be-fe-settingsLink");
    if (setBlock) {
        if (localStorage['be-fe-version'] === startVersion) {
            setBlock.classList.remove("be-fe-have-upgrade");
        } else {
            setBlock.classList.add("be-fe-have-upgrade");
        }
    }
}, 2000);

lightBox.addEventListener("click", function () {
    lightBoxCont.innerHTML = "";
    lightBox.classList.add("hidden");
});

module.exports = function (node) {
    if (!startVersion) return;

    node = node || document.body;

    var sidebar = node.querySelector(".sidebar");
    if (!sidebar || sidebar.querySelector(".be-fe-settingsLink")) return;

    var link;
    sidebar.appendChild(
        h(".box.be-fe-settingsLink",
            h(".box-header-groups", "Add-ons"),
            h(".box-body",
                h("ul",
                    h("li",
                        link = h("a", "BetterFeed settings"),
                        h("div", {style: "font-size: 11px"}, startVersion, h("i.fa.fa-arrow-circle-up", {title: "Доступно обновление, перезагрузите страницу"}))
                    )
                )
            )
        )
    );

    link.addEventListener("click", function (e) {
        e.preventDefault();

        var url = 'https://cdn.rawgit.com/davidmz/BetterFeed/' + startVersion + '/src/options/options.html?origin=' + encodeURIComponent(location.origin);

        if (/iPhone|iPad/.test(navigator.userAgent)) {
            window.open(url, "_blank");
            return;
        }

        document.body.appendChild(lightBox);
        lightBoxCont.innerHTML = "";
        lightBoxCont.appendChild(h("iframe.light-box-iframe", {src: url, frameborder: "0"}));
        lightBox.classList.remove("hidden");
    });
};

