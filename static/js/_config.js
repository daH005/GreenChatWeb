export var HTTP_BASE_URL = "";  // <- HTTP_API_URL
if (!HTTP_BASE_URL) {
    HTTP_BASE_URL = "http://localhost:5181";
}

export const HTTP_REG_URL = HTTP_BASE_URL + "/user/new";
export const HTTP_CHECK_USERNAME_URL = HTTP_BASE_URL + "/user/new/check/username";
export const HTTP_CHECK_EMAIL_URL = HTTP_BASE_URL + "/user/new/check/email";
export const HTTP_SEND_EMAIL_CODE_URL = HTTP_BASE_URL + "/user/new/code/send";
export const HTTP_CHECK_EMAIL_CODE_URL = HTTP_BASE_URL + "/user/new/code/check";
export const HTTP_AUTH_URL = HTTP_BASE_URL + "/user/auth";
export const HTTP_REFRESH_TOKEN_URL = HTTP_BASE_URL + "/user/refreshToken";
export const HTTP_USER_INFO_URL = HTTP_BASE_URL + "/user/info";
export const HTTP_USER_CHATS_URL = HTTP_BASE_URL + "/user/chats";
export const HTTP_CHAT_HISTORY_URL = HTTP_BASE_URL + "/chats/{}/history";

export var WEBSOCKET_URL = "";  // <- WEBSOCKET_URL
if (!WEBSOCKET_URL) {
    WEBSOCKET_URL = "ws://localhost:5180";
} else {
    let protocol = window.location.protocol;
    if (protocol == "https") {
        protocol = "wss";
    } else {
        protocol = "ws";
    }
    let host = window.location.host;
    let port = window.location.port;
    WEBSOCKET_URL = protocol + "//" + host + ":" + port + WEBSOCKET_URL;
}
console.log("WEBSOCKET_URL -", WEBSOCKET_URL);

export const JWT_TOKEN_LOCAL_STORAGE_KEY = "JWTToken";
export const JWT_TOKEN_REFRESH_INTERVAL_DELAY = 1000 * 60 * 15;

export const BASE_HEADERS = {
	"Content-Type": "application/json",
}
