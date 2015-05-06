var h = require("../utils/html");
require('../../less/lightbox.less');

/** @type {Element} */
var lightBoxCont = h(".light-box-container.be-fe-settingsLB");
var lightBox = h(".frf-co-light-box.hidden", h(".light-box-shadow", lightBoxCont));

module.exports = function (node) {
    var version = localStorage['be-fe-version'];
    if (!version) return;

    node = node || document.body;

    var sidebar = node.querySelector(".sidebar");
    if (!sidebar || sidebar.querySelector(".be-fe-settingsLink")) return;

    var link;
    sidebar.appendChild(
        h(".box.be-fe-settingsLink",
            h("div", (link = h("a", "BetterFeed settings"))),
            h("div", h("small", version))
        )
    );

    link.addEventListener("click", function (e) {
        e.preventDefault();

        document.body.appendChild(lightBox);
        lightBoxCont.innerHTML = "";
        lightBoxCont.appendChild(h("iframe.light-box-iframe", {
            src: 'https://cdn.rawgit.com/davidmz/BetterFeed/' + version + '/src/options/options.html',
            frameborder: "0"
        }));
        lightBox.classList.remove("hidden");
    });
};

