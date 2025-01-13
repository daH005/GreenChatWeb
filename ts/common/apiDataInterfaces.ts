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

export interface ChatMessages {
    messages: Message[],
}

export interface Message {
    id: number,
    userId: number,
    chatId: number, 
    text: string,
    creatingDatetime: string | Date,
    isRead: boolean,
    storageId?: number,
    user?: User,
}

export interface MessageStorageId {
    storageId: number,
}

export interface MessageFilenames {
    filenames: string[],
}

export interface MessageTyping {
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
    lastMessage?: Message,
    userIds: number[],
    unreadCount: number,
    users?: User[],
    interlocutor?: User,
}

export interface NewUnreadCount {
    chatId: number,
    unreadCount: number,
}

export interface ReadMessagesIds {
    chatId: number,
    messageIds: number[],
}

export interface InterlocutorsOnlineStatuses {
    [interlocutorId: number]: boolean,
}
