var nextRequestId = 1;

const responseAction = "@response";

export default class Messenger {

    constructor() {
        this.__responders = new Map();
        this.__listeners = new Map();

        window.addEventListener('message', event => {
            if (typeof event.data !== "object") {
                return;
            }
            //noinspection UnnecessaryLocalVariableJS
            const {data:{action, requestId, value}, source, origin} = event;

            if (action === responseAction && this.__responders.has(requestId)) {
                this.__responders.get(requestId)(value);
                this.__responders.delete(requestId);

            } else if (this.__listeners.has(action)) {
                let resp = this.__listeners.get(action)(value);
                source.postMessage({action: responseAction, requestId, value: resp}, origin);
            }
        });
    }

    /**
     *
     * @param {Window} window
     * @param {String} origin
     * @param {String} action
     * @param {*} value
     * @return {Promise}
     */
    send(window, origin, action, value = null) {
        return new Promise(resolve => {
            const requestId = nextRequestId++;
            this.__responders.set(requestId, resolve);
            window.postMessage({action, requestId, value}, origin);
        });
    }

    /**
     *
     * @param {String} action
     * @param {function} callback
     */
    on(action, callback) {
        this.__listeners.set(action, callback);
    }
}
