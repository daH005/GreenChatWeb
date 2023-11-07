import { AUTH_TOKEN_COOKIE_KEY, BASE_HEADERS } from "../_config.js";
import { getCookie } from "../_cookie.js";

// Токен авторизации. Необходим для работы с API (HTTP + WebSocket).
export const AUTH_TOKEN = getCookie(AUTH_TOKEN_COOKIE_KEY);
// Переопределяет базовые заголовки, добавив в них токен авторизации.
export const BASE_AUTH_HEADERS = {
    ...BASE_HEADERS,
    authToken: AUTH_TOKEN,
}
