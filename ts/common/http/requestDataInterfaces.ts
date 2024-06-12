export interface EmailCheckRequestData {
    email: string,
}

export interface EmailCodeSendRequestData {
    email: string,
}

export interface EmailCodeCheckRequestData {
    email: string,
    code: number,
}

export interface LoginRequestData {
    email: string,
    code: number,
}

export interface UserInfoRequestData {
    userId: number,
}

export interface UserAvatarRequestData {
    userId: number,
}

export interface UserInfoEditRequestData {
    firstName: string,
    lastName: string,
}

export interface ChatHistoryRequestData {
    chatId: number,
    offsetFromEnd?: number,
}
