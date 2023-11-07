import { WEBSOCKET_URL } from "../config.js";
import { AUTH_TOKEN } from "./config.js";

export var websocket;

export function startWebSocket(handleMessageFunc) {
    websocket = new WebSocket(WEBSOCKET_URL);

    websocket.onopen = (event) => {
        // Отправляем авторизующее сообщение.
        websocket.sendMessage({authToken: AUTH_TOKEN})
    }

    websocket.onmessage = (event) => {
        // Обрабатываем сообщение, полученное от сервера.
        let message = JSON.parse(event.data);
        websocket.handleMessage(message);
    }
    websocket.handleMessage = handleMessageFunc;

    websocket.sendMessage = (data) => {
        websocket.send(JSON.stringify(data));
    }

}
