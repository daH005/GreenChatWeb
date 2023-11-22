import { JWT_TOKEN_LOCAL_STORAGE_KEY, BASE_HEADERS } from "../_config.js";

// JWT-токен, необходимый для работы с нашим API (HTTP + WebSocket).
export const JWT_TOKEN = localStorage.getItem(JWT_TOKEN_LOCAL_STORAGE_KEY);
// Переопределяет базовые заголовки, добавив в них JWT-токен.
export const BASE_AUTH_HEADERS = {
    ...BASE_HEADERS,
    Authorization: `Bearer ${JWT_TOKEN}`,
}
