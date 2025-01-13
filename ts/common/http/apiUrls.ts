var _HTTP_API_BASE_URL: string = "";  // <- HTTP_API_URL // Comment For Nginx
if (!_HTTP_API_BASE_URL) {
    _HTTP_API_BASE_URL = "https://localhost:5181";
}

export const HTTP_API_URLS = {
    USER_EMAIL_CHECK: _HTTP_API_BASE_URL + "/user/login/email/check",
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

    CHAT_MESSAGES: _HTTP_API_BASE_URL + "/chat/messages",
    MESSAGES_FILES_SAVE: _HTTP_API_BASE_URL + "/chat/messages/files/save",
    MESSAGES_FILES_NAMES: _HTTP_API_BASE_URL + "/chat/messages/files/names",
    MESSAGES_FILES_GET: _HTTP_API_BASE_URL + "/chat/messages/files/get",
}
