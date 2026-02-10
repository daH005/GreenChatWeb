import { APIUser } from "../../common/apiDataInterfaces.js";

export interface ChatSignal {
    chatId: number,
}

export interface MessageSignal {
    chatId: number,
    messageId: number,
}

export interface TypingSignal {
    chatId: number,
    userId: number,
}

export interface ReadSignal {
    chatId: number,
    messageIds: number[],
}

export interface OnlineStatusesSignal {
    [interlocutorId: number]: boolean,
}
