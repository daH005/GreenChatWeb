export interface APIUser {
    id: number;
    firstName: string,
    lastName: string,
    isOnline: boolean,
    email?: string,
}

export interface APIChat {
    id: number,
    name: string,
    isGroup: boolean,
    unreadCount: number,
    userIds: number[],
    interlocutorId: number | null,
}

export interface APIMessage {
    id: number,
    userId: number,
    chatId: number,
    text: string,
    isRead: boolean,
    hasFiles: boolean,
    creatingDatetime: string | Date,
}
