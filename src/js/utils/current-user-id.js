export var userId = null;
export var authToken = null;

let cookieName = 'freefeed_authToken';
if (location.hostname === 'micropeppa.freefeed.net') {
    cookieName = 'micropeppa_authToken';
}

let matches = document.cookie.match(new RegExp(`(?:^|;\\s*)${cookieName}=([^;]*)`));
let cookieValue = matches ? matches[1] : null;

if (cookieValue) {
    let parts = cookieValue.split(".");
    if (parts.length === 3) {
        try {
            let payload = JSON.parse(atob(parts[1]));
            if ("userId" in payload) {
                userId = payload["userId"];
                authToken = cookieValue;
            }
        } catch (e) {
        }
    }
}

