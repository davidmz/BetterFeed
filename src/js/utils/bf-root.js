var myRoot = "https://cdn.rawgit.com/davidmz/BetterFeed/" + localStorage['be-fe-version'];
if (document.currentScript) {
    var pr = document.currentScript.src.split("/");
    myRoot = pr.slice(0, pr.length - 2).join("/");
}

export default myRoot;
