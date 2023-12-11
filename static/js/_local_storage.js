import { JWT_TOKEN_LOCAL_STORAGE_KEY } from "./_config.js";

// Сохраняет JWT-токен в `localStorage`.
export function saveJWTToken(token) {
    localStorage.setItem(JWT_TOKEN_LOCAL_STORAGE_KEY, token);
}

// Выдаёт JWT-токен из `localStorage`. Если токена там нет, то возвращается
// "undefined" / "null" (как показала практика, это именно строки).
export function getJWTToken() {
    return localStorage.getItem(JWT_TOKEN_LOCAL_STORAGE_KEY);
}
