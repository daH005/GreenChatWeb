export const OUR_ENDPOINTS_URLS = {
    MAIN: "/",
    LOGIN: "/login",
    REG: "/reg",
}

export var HTTP_BASE_URL = "";  // <- HTTP_API_URL
if (!HTTP_BASE_URL) {
    HTTP_BASE_URL = "http://localhost:5181";
}

export const HTTP_ENDPOINTS_URLS = {
    REG: HTTP_BASE_URL + "/user/new",
    CHECK_USERNAME: HTTP_BASE_URL + "/user/new/check/username",
    CHECK_EMAIL: HTTP_BASE_URL + "/user/new/check/email",
    SEND_EMAIL_CODE: HTTP_BASE_URL + "/user/new/code/send",
    CHECK_EMAIL_CODE: HTTP_BASE_URL + "/user/new/code/check",
    AUTH: HTTP_BASE_URL + "/user/auth",
    REFRESH_TOKEN: HTTP_BASE_URL + "/user/refreshToken",
    USER_INFO: HTTP_BASE_URL + "/user/info",
    USER_CHATS: HTTP_BASE_URL + "/user/chats",
    CHAT_HISTORY: HTTP_BASE_URL + "/chats/{chatId}/history",
}

export var WEBSOCKET_URL = "";  // <- WEBSOCKET_URL
if (!WEBSOCKET_URL) {
    WEBSOCKET_URL = "ws://localhost:5180";
} else {
    let protocol = window.location.protocol;
    if (protocol == "https:") {
        protocol = "wss";
    } else {
        protocol = "ws";
    }
    let host = window.location.host;
    let port = window.location.port;
    WEBSOCKET_URL = protocol + "://" + host + WEBSOCKET_URL;
    console.log("WEBSOCKET_URL -", WEBSOCKET_URL);
}

export const JWT_TOKEN_REFRESH_INTERVAL_DELAY = 1000 * 60 * 15;

export const BASE_HEADERS = {
	"Content-Type": "application/json",
}
