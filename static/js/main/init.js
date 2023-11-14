import { AUTH_TOKEN } from "./_auth_cookie.js";
import { requestUserInfo, requestUserChats, redirectToLoginPage } from "./_http.js";
import { startWebSocket } from "./_websocket.js";
import { displayUserInfo, displayUserChats, displayChatMessage } from "./_html.js";

if (!AUTH_TOKEN) {
    redirectToLoginPage();
}

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
