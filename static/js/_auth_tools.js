import { BASE_HEADERS } from "./_config.js";
import { getJWTToken, saveJWTToken } from "./_local_storage.js";
import { redirectToMainPage } from "./_redirects.js";

// Формирует заголовки запроса с 'Content-Type' + JWT-токеном.
export function makeAuthHeaders() {
    return {
        ...BASE_HEADERS,
        Authorization: `Bearer ${getJWTToken()}`,
    }
}

// Сохраняет JWT-токен в `localStorage` и перенаправляет на главную.
export function saveJWTTokenAndRedirect(token) {
    saveJWTToken(token);
    redirectToMainPage();
}
