import { websocket, AnyWebSocketMessageType } from "../websocket/init.js";

export function sendMessageToWebSocketAndClearInput(data: AnyWebSocketMessageType, inputEl: HTMLInputElement | HTMLTextAreaElement): void {
    websocket.sendMessage(data);
    inputEl.value = "";
    inputEl.style.height = "50px";  // FixMe: Может быть 'auto'?
}
