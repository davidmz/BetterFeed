var h = require("../utils/html");
require('../../less/lightbox.less');

module.exports = function () {
    var version = localStorage['be-fe-version'] || 11;
    var sidebar = document.body.querySelector(".sidebar");

    if (!sidebar || !version) return;

    var link;
    sidebar.appendChild(
        h(".box",
            h("div", (link = h("a", "BetterFeed settings"))),
            h("div", h("small", version))
        )
    );

    /** @type {Element} */
    var lightBoxCont = h(".light-box-container");
    var lightBox = h(".frf-co-light-box.hidden", h(".light-box-shadow", lightBoxCont));
    document.body.appendChild(lightBox);

    link.addEventListener("click", function (e) {
        e.preventDefault();

        lightBoxCont.innerHTML = "";
        lightBoxCont.appendChild(h("iframe.light-box-iframe", {
            src: 'https://cdn.rawgit.com/davidmz/BetterFeed/' + version + '/src/options/options.html',
            frameborder: "0"
        }));
        lightBox.classList.remove("hidden");
    });
};