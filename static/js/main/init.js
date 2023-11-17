import { AUTH_TOKEN } from "./_auth_cookie.js";
import { requestUserInfo, requestUserChats, redirectToLoginPage } from "./_http.js";
import { startWebSocket } from "./_websocket.js";
import { displayUserInfo, displayUserChats, displayChatMessage } from "./_html.js";

// Важно: запрещает переход вперёд-назад по истории браузера (а точнее вкладки).
// Работает, как на ПК, так и на телефоне.
window.addEventListener("popstate", () => {
    window.history.pushState({}, null, null);
});

if (!AUTH_TOKEN) {
    redirectToLoginPage();
}

console.log("Загружаем пользователя...");
displayUserInfo(await requestUserInfo());

console.log("Загружаем чаты...");
displayUserChats(await requestUserChats());

console.log("Запускаем веб-сокет...");
startWebSocket(displayChatMessage);
