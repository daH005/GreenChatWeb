import { JWT } from "../_localStorage.js";
import { requestNewJWT } from "../_http.js";
import { JWT_TOKEN_REFRESH_INTERVAL_DELAY } from "../_config.js";
import { startWebSocket } from "./_websocket.js";
import { initHtml, handlersForWebsocket } from "./_messaging/init.js";
import "./_userSettings.js";

async function updateJWT() {
    let data = await requestNewJWT();
    JWT.set(data.JWT);
    console.log("Токен обновлён!");
}

updateJWT();
setInterval(async () => {
    updateJWT();
}, JWT_TOKEN_REFRESH_INTERVAL_DELAY);

await initHtml();  // important! wait all chats loading and other things

startWebSocket(handlersForWebsocket);
