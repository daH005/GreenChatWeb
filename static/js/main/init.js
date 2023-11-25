import { getJWTToken, saveJWTToken } from "../_local_storage.js";
import { redirectToLoginPage } from "../_redirects.js";
import { JWT_TOKEN_REFRESH_INTERVAL_DELAY } from "../_config.js";
import { requestUserInfo, requestUserChats, requestNewJWTToken } from "./_http.js";
import { startWebSocket } from "./_websocket.js";
import { displayUserInfo, displayUserChats, displayChatMessage } from "./_html.js";

// FixMe: Ещё важнее: после запуска nginx код перестал работать, как задумывалось.
// Важно: запрещает переход вперёд-назад по истории браузера (а точнее вкладки).
// Работает, как на ПК, так и на телефоне.
window.history.pushState(null, "", window.location.href);
window.onpopstate = function() {
    window.history.pushState(null, "", window.location.href);
}

// Если в `localStorage` совсем нет токена, то сразу же перенаправляемся на страницу авторизации.
if (getJWTToken() == "undefined") {  // Не опечатка. Из `localStorage` возвращается именно строка, а не обычный undefined.
    redirectToLoginPage();
}

// Периодическое обновление JWT-токена.
setInterval(async () => {
    let data = await requestNewJWTToken();
    saveJWTToken(data.JWTToken);
    console.log("Токен обновлён!");
}, JWT_TOKEN_REFRESH_INTERVAL_DELAY);

console.log("Загружаем пользователя...");
displayUserInfo(await requestUserInfo());

console.log("Загружаем чаты...");
displayUserChats(await requestUserChats());

console.log("Запускаем веб-сокет...");
startWebSocket(displayChatMessage);
