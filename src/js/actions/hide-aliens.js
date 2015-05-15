var h = require("../utils/html");

setInterval(function () {
    var hideAliens = !!localStorage["be-fe.hide-alien-posts"];
    var chk = document.body.querySelector(".be-fe-hide-aliens-switcher input");
    var posts = document.body.querySelector(".posts");
    var counter = document.body.querySelector(".be-fe-hide-aliens-counter");

    if (chk && chk.checked !== hideAliens) chk.checked = hideAliens;
    if (posts && posts.classList.contains("be-fe-hide-aliens") !== hideAliens) {
        if (hideAliens) {
            posts.classList.add("be-fe-hide-aliens");
        } else {
            posts.classList.remove("be-fe-hide-aliens");
        }
    }
    if (counter && posts) {
        counter.innerHTML = posts.querySelectorAll(".be-fe-post-from-alien").length;
    }
}, 500);

module.exports = function (node, settings) {
    if (!settings["where-this-post-from"]) return;

    // включаемся только на френдленте
    if (location.pathname !== "/") return;

    if (!document.body.querySelector(".be-fe-hide-aliens-switcher")) {
        var chk = null;
        document.body.querySelector(".box-header-timeline").appendChild(
            h(".be-fe-hide-aliens-switcher",
                h("label",
                    (chk = h("input", {type: "checkbox"})),
                    " hide non-friends posts (",
                    h("span.be-fe-hide-aliens-counter", "0"),
                    ")"
                )
            )
        );
        chk.addEventListener("change", function () {
            localStorage["be-fe.hide-alien-posts"] = chk.checked ? "1" : "";
        });

        chk.checked = !!localStorage["be-fe.hide-alien-posts"];
    }
};
