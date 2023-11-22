import { WEBSOCKET_URL } from "../_config.js";
import { JWT_TOKEN } from "./_auth_constants.js";

// Объект веб-сокета. Инициализируется в `startWebSocket(...)`.
export var websocket;

// Инициализирует веб-сокет.
// Также определяет два кастомных метода:
// 1. `websocket.handleMessage(...)` - вызывается при получении сообщения от сервера.
//    В него передаётся десериализованный JSON.
//    Ожидается `Object` - {chatId, userId, username, firstName, lastName, text, creatingDatetime}.
// 2. `websocket.sendMessage(...)` - сериализует переданные данные в JSON и отправляет на сервер.
//    Ожидается `Object` - {chatId, text}.
export function startWebSocket(handleMessageFunc) {
    websocket = new WebSocket(WEBSOCKET_URL);

    websocket.onopen = (event) => {
        // Отправляем авторизующее сообщение.
        websocket.sendMessage({JWTToken: JWT_TOKEN})
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
