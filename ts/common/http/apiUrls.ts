var _HTTP_API_BASE_URL: string = "";  // <- HTTP_API_URL // Comment For Nginx
if (!_HTTP_API_BASE_URL) {
    _HTTP_API_BASE_URL = "https://localhost:5181";
}

export const HTTP_API_URLS = {
    USER_EMAIL_CODE_SEND: _HTTP_API_BASE_URL + "/user/login/email/code/send",
    USER_EMAIL_CODE_CHECK: _HTTP_API_BASE_URL + "/user/login/email/code/check",
    USER_LOGIN: _HTTP_API_BASE_URL + "/user/login",
    USER_LOGOUT: _HTTP_API_BASE_URL + "/user/logout",
    USER_REFRESH_ACCESS: _HTTP_API_BASE_URL + "/user/refreshAccess",
    USER: _HTTP_API_BASE_URL + "/user",
    USER_AVATAR: _HTTP_API_BASE_URL + "/user/avatar",
    USER_BACKGROUND: _HTTP_API_BASE_URL + "/user/background",
    USER_EDIT: _HTTP_API_BASE_URL + "/user/edit",
    USER_AVATAR_EDIT: _HTTP_API_BASE_URL + "/user/avatar/edit",
    USER_BACKGROUND_EDIT: _HTTP_API_BASE_URL + "/user/background/edit",
    USER_CHATS: _HTTP_API_BASE_URL + "/user/chats",

    CHAT: _HTTP_API_BASE_URL + "/chat",
    CHAT_NEW: _HTTP_API_BASE_URL + "/chat/new",
    CHAT_TYPING: _HTTP_API_BASE_URL + "/chat/typing",
    CHAT_UNREAD_COUNT: _HTTP_API_BASE_URL + "/chat/unreadCount",
    CHAT_MESSAGE: _HTTP_API_BASE_URL + "/chat/message",
    CHAT_MESSAGE_NEW: _HTTP_API_BASE_URL + "/chat/message/new",
    CHAT_MESSAGE_READ: _HTTP_API_BASE_URL + "/chat/message/read",
    CHAT_MESSAGES: _HTTP_API_BASE_URL + "/chat/messages",
    CHAT_MESSAGE_FILES_SAVE: _HTTP_API_BASE_URL + "/chat/message/files/save",
    CHAT_MESSAGE_FILES_NAMES: _HTTP_API_BASE_URL + "/chat/message/files/names",
    CHAT_MESSAGE_FILES_GET: _HTTP_API_BASE_URL + "/chat/message/files/get",
}
