import { JWT } from "../../common/localStorage.js";
import { WEBSOCKET_URL } from "./url.js";
export var websocket;
export function initWebSocket(handlers) {
    websocket = new WebSocket(WEBSOCKET_URL);
    websocket.onopen = () => {
        websocket.send(JWT.get());
    };
    websocket.onmessage = async (event) => {
        let message = JSON.parse(event.data);
        await handlers[message.type](message.data);
    };
    websocket.sendMessage = (data) => {
        websocket.send(JSON.stringify(data));
    };
}
