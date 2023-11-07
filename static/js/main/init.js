import { requestUserInfo, requestUserChats } from "./http.js";
import { startWebSocket } from "./websocket.js";
import { displayUserInfo, displayUserChats, displayChatMessage } from "./html.js";

console.log("Загружаем пользователя...");
displayUserInfo(await requestUserInfo());

console.log("Загружаем чаты...");
displayUserChats(await requestUserChats());

console.log("Запускаем веб-сокет...");
startWebSocket(displayChatMessage);
