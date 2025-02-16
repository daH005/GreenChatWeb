import { APIUser } from "../../common/apiDataInterfaces.js";

export interface ChatId {
    chatId: number,
}

export interface MessageId {
    messageId: number,
}

export interface Typing {
    chatId: number,
    userId: number,
    user?: APIUser,
}

export interface Read {
    chatId: number,
    messageIds: number[],
}

export interface OnlineStatuses {
    [interlocutorId: number]: boolean,
}
