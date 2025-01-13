export interface EmailAndCodeRequestData {
    email: string,
    code: number,
}

export interface UserEditRequestData {
    firstName: string,
    lastName: string,
}

export interface NewChatRequestData {
    userIds: number[],
    isGroup?: boolean,
    name?: string,
}

export interface NewMessageRequestData {
    chatId: number,
    text: string,
    storageId?: number | null,
}

export interface MessagesRequestData {
    chatId: number,
    offset?: number,
}
