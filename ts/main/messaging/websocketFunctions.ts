import { sendWebSocketMessage, AnyWebSocketMessageType } from "../websocket/init.js";

export function sendMessageToWebSocketAndClearInput(data: AnyWebSocketMessageType, inputEl: HTMLInputElement | HTMLTextAreaElement): void {
    sendWebSocketMessage(data);
    inputEl.value = "";
    inputEl.style.height = "50px";  // FixMe: Может быть 'auto'?
}
