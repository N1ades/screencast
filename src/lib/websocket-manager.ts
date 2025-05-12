import { EventListener } from "./event-listener";

export class WebsocketManager extends EventListener<'reconnect' | 'open' | 'message' | 'error' | 'close'> {
    open: boolean;
    url: any;
    ws?: WebSocket;

    constructor(url: string) {
        super();
        this.open = true;
        this.url = url;
        this.connect();
    }

    reconnectTimeout = () => setTimeout(() => {
        if (this.ws) {
            this.ws.close();
            delete this.ws;
        }
        this._callEventListeners("reconnect");
        console.log('reconnecting websocket');
        this.connect();
    }, 5000 + 2000)

    pingTimeout = this.reconnectTimeout();

    heartbeat = () => {
        clearTimeout(this.pingTimeout);
        this.pingTimeout = this.reconnectTimeout();
    }

    connect = () => {
        console.log('create WebSocket');

        this.ws = new WebSocket(this.url);

        this.ws.addEventListener("error", (event) => {
            this.heartbeat();
            console.error(event);

            this._callEventListeners("error", event);
        });

        this.ws.addEventListener("open", (event) => {
            console.log("open");
            this.heartbeat();

            this._callEventListeners("open", event);
        });

        this.ws.addEventListener("message", (event) => {

            if (typeof event.data !== 'string') {
                console.error('unsupported messageType');
                return;
            }

            if (event.data.length === 0) {
                this.heartbeat();
                return;
            }

            this._callEventListeners("message", event);
        });

        this.ws.addEventListener("close", (event) => {
            console.log('close');
            if (this.open) {
                console.log('wait for reconnect');
                return // wait for reconnect
            }

            this._callEventListeners("reconnect", event);
            this._callEventListeners("close", event);
        });
    }


    send = (data) => {
        this.ws.send(data);
    }

    close = () => {
        this.ws.close();
        delete this.ws;
        clearTimeout(this.pingTimeout);
        this.open = false;
        this.eventListeners = {};

    }

    _close = () => {
        this.ws.close();
    }
}
