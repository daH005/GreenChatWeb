import { WEBSOCKET_URL } from "../_config.js";
import { JWT } from "../_localStorage.js";

export var websocket;

export function startWebSocket(handlers) {
    websocket = new WebSocket(WEBSOCKET_URL);

    websocket.onopen = (event) => {
        websocket.send(JWT.get());
    }

    websocket.onmessage = async (event) => {
        let message = JSON.parse(event.data);
        await handlers[message.type](message.data);
    }

    websocket.sendJSON = (data) => {
        websocket.send(JSON.stringify(data));
    }

}
