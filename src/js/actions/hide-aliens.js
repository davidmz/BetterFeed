import h from "../utils/html";

/**
 *
 * @param {HTMLElement|null} node
 * @param {Settings} settings
 */
export default function (node, settings) {
    if (!settings.flag("where-this-post-from")) return;

    if (node === undefined) {
        setInterval(function () {
            var hideAliens = settings.hideAlienPosts;
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
    }

    // включаемся только на френдленте
    if (location.pathname !== "/") return;

    if (!document.body.querySelector(".be-fe-hide-aliens-switcher")) {
        var chk = null;
        var timeLineHeader = document.body.querySelector(".box-header-timeline");
        if (timeLineHeader) {
            timeLineHeader.appendChild(
                h(".be-fe-hide-aliens-switcher",
                    h("label",
                        (chk = h("input", {type: "checkbox"})),
                        " hide non-friends posts (",
                        h("span.be-fe-hide-aliens-counter", "0"),
                        ")"
                    )
                )
            );
            chk.checked = settings.hideAlienPosts;
            chk.addEventListener("change", () => {
                settings.hideAlienPosts = chk.checked;
                settings.save();
            });
        }
    }
};
