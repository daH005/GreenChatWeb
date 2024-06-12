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
    usersIds: number[],
    text: string,
    name?: string,
    isGroup?: boolean,
}

export interface NewChatMessage {
    chatId: number,
    text: string,
}

export interface ChatMessageWasRead {
    chatMessageId: number,
}
