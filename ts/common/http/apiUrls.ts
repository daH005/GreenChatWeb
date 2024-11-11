export var HTTP_API_BASE_URL: string = "";  // <- HTTP_API_URL // Comment For Nginx
if (!HTTP_API_BASE_URL) {
    HTTP_API_BASE_URL = "https://localhost:5181";
}

export const HTTP_API_URLS = {
    EMAIL_CHECK: HTTP_API_BASE_URL + "/user/login/email/check",
    EMAIL_CODE_SEND: HTTP_API_BASE_URL + "/user/login/email/code/send",
    EMAIL_CODE_CHECK: HTTP_API_BASE_URL + "/user/login/email/code/check",
    LOGIN: HTTP_API_BASE_URL + "/user/login",
    REFRESH_ACCESS: HTTP_API_BASE_URL + "/user/refreshAccess",
    USER_INFO: HTTP_API_BASE_URL + "/user/info",
    USER_AVATAR: HTTP_API_BASE_URL + "/user/avatar",
    USER_BACKGROUND: HTTP_API_BASE_URL + "/user/background",
    USER_INFO_EDIT: HTTP_API_BASE_URL + "/user/info/edit",
    USER_AVATAR_EDIT: HTTP_API_BASE_URL + "/user/avatar/edit",
    USER_BACKGROUND_EDIT: HTTP_API_BASE_URL + "/user/background/edit",
    USER_CHATS: HTTP_API_BASE_URL + "/user/chats",
    CHAT_HISTORY: HTTP_API_BASE_URL + "/chat/history",
    CHAT_MESSAGES_FILES_SAVE: HTTP_API_BASE_URL + "/chat/messages/files/save",
    CHAT_MESSAGES_FILES_NAMES: HTTP_API_BASE_URL + "/chat/messages/files/names",
    CHAT_MESSAGES_FILES_GET: HTTP_API_BASE_URL + "/chat/messages/files/get",
}
