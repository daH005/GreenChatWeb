import { WebSocketMessageType } from "./messageTypes.js";

export interface WebSocketMessage<T> {
    type: WebSocketMessageType,
    data: T,
}

export interface UserId {
    userId: number,
}

export interface ChatId {
    chatId: number,
}

export interface NewChat {
    userIds: number[],
    name?: string,
    isGroup?: boolean,
}

export interface NewMessage {
    chatId: number,
    text: string,
    storageId?: number,
}

export interface MessageWasRead {
    messageId: number,
}
