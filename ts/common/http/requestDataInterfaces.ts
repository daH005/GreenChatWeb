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
}

export interface MessageEditRequestData {
    messageId: number,
    text: string,
}

export interface MessageFilesDeleteRequestData {
    messageId: number,
    filenames: string[],
}

export interface PaginationRequestData {
    offset?: number,
    size?: number,
}
