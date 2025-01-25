export interface User {
    id: number;
    firstName: string,
    lastName: string,
    isOnline: boolean,
    email?: string,
}

export interface Chat {
    id: number,
    name: string,
    isGroup: boolean,
    lastMessage: Message | null,
    unreadCount: number,
    userIds: number[],
    interlocutorId: number | null,
    users?: User[],
    interlocutor?: User,
}

export interface Message {
    id: number,
    userId: number,
    chatId: number,
    text: string,
    isRead: boolean,
    hasFiles: boolean,
    creatingDatetime: string | Date,
    user?: User,
}
