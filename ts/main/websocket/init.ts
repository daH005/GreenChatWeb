import { JWT } from "../../common/localStorage.js";
import { WEBSOCKET_URL } from "./url.js";
import { WebSocketMessage,
         UserId,
         ChatId,
         NewChat,
         NewChatMessage,
         ChatMessageWasRead,
       } from "./clientDataInterfaces.js";

export type AnyWebSocketMessageType = WebSocketMessage<UserId | ChatId | NewChat | NewChatMessage | ChatMessageWasRead>;
export var websocket;

export function initWebSocket(handlers: Object): void {
    websocket = new WebSocket(WEBSOCKET_URL);

    websocket.onopen = () => {
        websocket.send(JWT.get());
    }

    websocket.onmessage = async (event: MessageEvent) => {
        let message = JSON.parse(event.data);
        await handlers[message.type](message.data);
    }

    websocket.sendMessage = (data: AnyWebSocketMessageType) => {
        websocket.send(JSON.stringify(data));
    }

}
