import { requestUserInfo, requestUserChats } from "./_http.js";
import { startWebSocket } from "./_websocket.js";
import { displayUserInfo, displayUserChats, displayChatMessage } from "./_html.js";

console.log("Загружаем пользователя...");
requestUserInfo().then((data) => {
    displayUserInfo(data);
});

console.log("Загружаем чаты...");
requestUserChats().then((data) => {
    displayUserChats(data);
});

console.log("Запускаем веб-сокет...");
startWebSocket(displayChatMessage);
