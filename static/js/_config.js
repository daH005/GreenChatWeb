// URL-адреса для работы с HTTP частью api:
export const HTTP_BASE_URL = "http://localhost:81";
export const HTTP_AUTH_URL = HTTP_BASE_URL + "/auth";
export const HTTP_USER_INFO_URL = HTTP_BASE_URL + "/userInfo";
export const HTTP_USER_CHATS_URL = HTTP_BASE_URL + "/userChats";
export const HTTP_CHAT_HISTORY_URL = HTTP_BASE_URL + "/chatHistory";

// URL-адрес для работы по веб-сокету.
export const WEBSOCKET_URL = "ws://localhost:80";

// Время в секундах, определяющее сколько токен авторизации должен храниться в cookie.
export const AUTH_COOKIE_MAX_AGE = 3600 * 24 * 365;
// Ключ, под которым мы храним токен авторизации в cookie.
export const AUTH_TOKEN_COOKIE_KEY = "authToken";
// Базовые заголовки для HTTP-запросов.
// Поскольку мы работаем с REST-api, то мы должны явно указать формат передаваемых данных - JSON.
export const BASE_HEADERS = {
	"Content-Type": "application/json",
}
