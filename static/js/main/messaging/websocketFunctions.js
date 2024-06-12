import { sendWebSocketMessage } from "../websocket/init.js";
export function sendMessageToWebSocketAndClearInput(data, inputEl) {
    sendWebSocketMessage(data);
    inputEl.value = "";
    inputEl.style.height = "50px"; // FixMe: Может быть 'auto'?
}
