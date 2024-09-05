import { WEBSOCKET_URL } from "./url.js";
import { WebSocketMessage,
         UserId,
         ChatId,
         NewChat,
         NewChatMessage,
         ChatMessageWasRead,
       } from "./clientDataInterfaces.js";
import { WebSocketMessageType } from "./messageTypes";

export type AnyWebSocketMessageType = WebSocketMessage<UserId | ChatId | NewChat | NewChatMessage | ChatMessageWasRead>;
var websocket: WebSocket;

export function initWebSocket(handlers: Partial<Record<WebSocketMessageType, Function>>): void {
    websocket = new WebSocket(WEBSOCKET_URL);

    websocket.onmessage = async (event: MessageEvent) => {
        let message = JSON.parse(event.data);
        await handlers[message.type](message.data);
    }

}

export function sendWebSocketMessage(data: AnyWebSocketMessageType): void {
    websocket.send(JSON.stringify(data));
}
