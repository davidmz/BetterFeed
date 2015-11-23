export default class WS {
    static minReconnectTimeout = 1000;
    static maxReconnectTimeout = 20000;

    constructor(url) {
        this.url = url;
        this.ws = null;
        this.onMessage = () => {};
        this.onConnect = () => {};
        this._sendBuf = [];
        this._reconnectTimer = null;
        this._reconnectTimeout = WS.minReconnectTimeout;
        this._connect();
        setInterval(() => {
            if (this.ws && this.ws.readyState == WebSocket.OPEN) {
                this.ws.send("2"); // ping
            }
        }, 20000);
    }

    send(m) {
        if (this.ws && this.ws.readyState == WebSocket.OPEN) {
            this.ws.send(m);
        } else {
            this._sendBuf.push(m);
        }
    }

    _connect() {
        this._reconnectTimer = null;
        this._reconnectTimeout *= 1.5;
        if (this._reconnectTimeout > WS.maxReconnectTimeout) {
            this._reconnectTimeout = WS.maxReconnectTimeout;
        }

        this.ws = new WebSocket(this.url);
        this.ws.onclose = () => this._reconnect();
        this.ws.onerror = () => this._reconnect();
        this.ws.onmessage = e => this.onMessage(e.data);
        this.ws.onopen = () => this._onopen();
    }

    _onopen() {
        this._reconnectTimeout = WS.minReconnectTimeout;
        this._sendBuf.forEach(m => this.ws.send(m));
        this._sendBuf = [];
        this.onConnect()
    }

    _reconnect() {
        if (this.ws.readyState == WebSocket.CONNECTING || this.ws.readyState == WebSocket.OPEN) {
            this.ws.close();
        }

        if (this._reconnectTimer === null) {
            this._reconnectTimer = setTimeout(() => this._connect(), this._reconnectTimeout);
        }
    }
}

