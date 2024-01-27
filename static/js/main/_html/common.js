import { websocket } from "../_websocket.js";

export function sendMessageToWebSocketAndClearInput(data, inputEl) {
    websocket.sendJSON(data);
    inputEl.value = "";
    inputEl.style.height = "50px";  // FixMe: Может быть 'auto'?
}
