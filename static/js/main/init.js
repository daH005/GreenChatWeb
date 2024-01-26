import { saveJWTToken } from "../_localStorage.js";
import { JWT_TOKEN_REFRESH_INTERVAL_DELAY } from "../_config.js";
import { requestUserChats, requestNewJWTToken } from "../_http.js";
import { startWebSocket } from "./_websocket.js";
import { displayUserInfo, displayUserChats, handlersForWebsocket } from "./_html.js";
import { user } from "./_user.js";

setInterval(async () => {
    let data = await requestNewJWTToken();
    saveJWTToken(data.JWTToken);
    console.log("Токен обновлён!");
}, JWT_TOKEN_REFRESH_INTERVAL_DELAY);

displayUserInfo(user);

console.log("Загружаем чаты...");
displayUserChats(await requestUserChats());

console.log("Запускаем веб-сокет...");
startWebSocket(handlersForWebsocket);
