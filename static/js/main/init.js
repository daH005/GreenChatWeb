import { JWTToken } from "../_localStorage.js";
import { requestNewJWTToken } from "../_http.js";
import { JWT_TOKEN_REFRESH_INTERVAL_DELAY } from "../_config.js";
import { startWebSocket } from "./_websocket.js";
import { initHtml, handlersForWebsocket } from "./_html/init.js";

setInterval(async () => {
    let data = await requestNewJWTToken();
    JWTToken.set(data.JWTToken);
    console.log("Токен обновлён!");
}, JWT_TOKEN_REFRESH_INTERVAL_DELAY);

await initHtml();  // important! wait all chats loading and other things

startWebSocket(handlersForWebsocket);
