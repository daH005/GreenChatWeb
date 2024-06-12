export interface SimpleResponseStatus {
    status: number,
}

export interface JWT {
    JWT: string,
}

export interface AlreadyTakenFlag {
    isAlreadyTaken: boolean,
}

export interface CodeIsValidFlag {
    codeIsValid: boolean,
}

export interface User {
    id: number;
    firstName: string,
    lastName: string,
    email?: string,
}

export interface ChatHistory {
    messages: ChatMessage[],
}

export interface ChatMessage {
    id: number,
    userId: number,
    chatId: number, 
    text: string,
    creatingDatetime: string | Date,
    isRead: boolean,
    user?: User,
}

export interface ChatMessageTyping {
    userId: number,
    chatId: number,
    user?: User,
}

export interface UserChats {
    chats: Chat[],
}

export interface Chat {
    id: number,
    name: string,
    isGroup: boolean,
    lastMessage: ChatMessage,
    usersIds: number[],
    unreadCount: number,
    users?: User[],
    interlocutor?: User,
}

export interface NewUnreadCount {
    chatId: number,
    unreadCount: number,
}

export interface ReadChatMessagesIds {
    chatId: number,
    chatMessagesIds: number[],
}

export interface InterlocutorsOnlineStatuses {
    [interlocutorId: number]: boolean,
}
