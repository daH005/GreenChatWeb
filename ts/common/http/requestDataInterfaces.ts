export interface EmailRequestData {
    email: string,
}

export interface EmailAndCodeRequestData extends EmailRequestData {
    email: string,
    code: number,
}

export interface UserIdRequestData {
    userId: number,
}

export interface UserEditRequestData {
    firstName: string,
    lastName: string,
}

export interface ChatHistoryRequestData {
    chatId: number,
    offsetFromEnd?: number,
}
