import { WEBSOCKET_URL } from "../_config.js";
import { getJWTToken } from "../_local_storage.js";

// Объект веб-сокета. Инициализируется в `startWebSocket(...)`.
export var websocket;

// Инициализирует веб-сокет.
// Также определяет два кастомных метода:
// 1. `websocket.handleMessage(...)` - вызывается при получении сообщения от сервера.
//    В него передаётся десериализованный JSON.
//    Ожидается объект - {type, data}.
// 2. `websocket.sendMessage(...)` - сериализует переданные данные в JSON и отправляет на сервер.
//    Передается объект - {type, data}.
export function startWebSocket(handleMessageFunc) {
    websocket = new WebSocket(WEBSOCKET_URL);

    websocket.onopen = (event) => {
        // Отправляем авторизующее сообщение.
        websocket.send(getJWTToken());
    }

    websocket.onmessage = (event) => {
        // Обрабатываем сообщение, полученное от сервера.
        let message = JSON.parse(event.data);
        websocket.handleMessage(message);
    }
    websocket.handleMessage = handleMessageFunc;

    websocket.sendMessage = (data) => {
        // Отправляем рядовое сообщение на сервер.
        websocket.send(JSON.stringify(data));
    }

}
