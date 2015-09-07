let userId = null;
let at = localStorage["authToken"];

if (at) {
    let parts = at.split(".");
    if (parts.length === 3) {
        try {
            let payload = JSON.parse(atob(parts[1]));
            if ("userId" in payload) {
                userId = payload["userId"];
            }
        } catch (e) {
        }
    }
}

export default userId;