import { WEBSOCKET_URL } from "./url.js";

var websocket: WebSocket;

export function initWebSocket(handlers): void {
    websocket = new WebSocket(WEBSOCKET_URL);

    websocket.onmessage = async (event: MessageEvent) => {
        let message = JSON.parse(event.data);
        await handlers[message.type](message.data);
    }

    websocket.onclose = async () => {
        initWebSocket(handlers);
    }

    websocket.onerror = async () => {
        initWebSocket(handlers);
    }

}
