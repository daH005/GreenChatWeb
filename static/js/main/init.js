import { JWTTokenExist, saveJWTToken } from "../_localStorage.js";
import { redirectToLoginPage } from "../_redirects.js";
import { JWT_TOKEN_REFRESH_INTERVAL_DELAY } from "../_config.js";
import { requestUserInfo, requestUserChats, requestNewJWTToken } from "../_http.js";
import { startWebSocket } from "./_websocket.js";
import { displayUserInfo, displayUserChats, handleWebSocketMessage } from "./_html.js";

window.history.pushState(null, "", window.location.href);
window.onpopstate = function() {
    window.history.pushState(null, "", window.location.href);
}

if (JWTTokenExist()) {
    redirectToLoginPage();
}

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
startWebSocket(handleWebSocketMessage);
