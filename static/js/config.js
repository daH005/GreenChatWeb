export const HTTP_BASE_URL = "http://localhost:81";
export const HTTP_AUTH_URL = HTTP_BASE_URL + "/auth";
export const HTTP_USER_INFO_URL = HTTP_BASE_URL + "/userInfo";
export const HTTP_USER_CHATS_URL = HTTP_BASE_URL + "/userChats";
export const HTTP_CHAT_HISTORY_URL = HTTP_BASE_URL + "/chatHistory";

export const WEBSOCKET_URL = "ws://localhost:80";

export const AUTH_COOKIE_MAX_AGE = 3600 * 24 * 365;
export const AUTH_TOKEN_COOKIE_KEY = "authToken";
export const BASE_HEADERS = {
	"Content-Type": "application/json",
}
