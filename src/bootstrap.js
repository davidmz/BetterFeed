(function () {
    var
        version = null,
        nextUpdate = 0,
        now = Date.now(),
        store = localStorage,
        pInt = parseInt,
        verName = 'be-fe-version',
        updName = 'be-fe-next-update';

    var inject = function (version) {
        var e = document.createElement("script");
        e.src = 'https://cdn.rawgit.com/davidmz/BetterFeed/' + version + '/build/better-feed.min.js';
        e.type = "text/javascript";
        e.charset = "utf-8";
        e.async = true;
        document.head.appendChild(e);
    };

    if (verName in store) {
        version = store[verName];
        nextUpdate = pInt(store[updName]);
        if (isNaN(nextUpdate)) {
            nextUpdate = 0;
        }
    }

    if (now > nextUpdate) {
        store[updName] = now + 3600 * 1000;
        var xhr = new XMLHttpRequest();
        xhr.open('GET', 'https://api.github.com/repos/davidmz/BetterFeed/tags?page=1&&per_page=1');
        xhr.responseType = "json";
        xhr.onload = function () {
            var tags = this.response;
            if (tags.length == 1 && "name" in tags[0]) {
                store[verName] = tags[0]["name"];
                store[updName] = now + 24 * 3600 * 1000;
                // первый запуск
                if (version === null) inject(tags[0]["name"]);
            }
        };
        xhr.send();
    }

    if (version !== null) inject(version);
})();
