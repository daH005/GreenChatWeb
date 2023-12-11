import { BASE_HEADERS } from "./_config.js";
import { getJWTToken } from "./_local_storage.js";

// Формирует заголовки запроса с 'Content-Type' + JWT-токеном.
export function makeAuthHeaders() {
    return {
        ...BASE_HEADERS,
        Authorization: `Bearer ${getJWTToken()}`,
    }
}
