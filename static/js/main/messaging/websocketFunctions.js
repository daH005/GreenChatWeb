import { websocket } from "../websocket/init.js";
export function sendMessageToWebSocketAndClearInput(data, inputEl) {
    websocket.sendMessage(data);
    inputEl.value = "";
    inputEl.style.height = "50px"; // FixMe: Может быть 'auto'?
}
