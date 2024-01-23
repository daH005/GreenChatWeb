import { WEBSOCKET_URL } from "../_config.js";
import { getJWTToken } from "../_localStorage.js";

export var websocket;

export function startWebSocket(handlers) {
    websocket = new WebSocket(WEBSOCKET_URL);

    websocket.onopen = (event) => {
        websocket.send(getJWTToken());
    }

    websocket.onmessage = (event) => {
        let message = JSON.parse(event.data);
        handlers[message.type](message.data);
    }

    websocket.sendJSON = (data) => {
        websocket.send(JSON.stringify(data));
    }

}
