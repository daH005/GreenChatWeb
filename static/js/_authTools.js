import { BASE_HEADERS } from "./_config.js";
import { getJWTToken, saveJWTToken } from "./_localStorage.js";
import { redirectToMainPage } from "./_redirects.js";

export function makeAuthHeaders() {
    return {
        ...BASE_HEADERS,
        Authorization: `Bearer ${getJWTToken()}`,
    }
}

export function saveJWTTokenAndRedirect(token) {
    saveJWTToken(token);
    redirectToMainPage();
}
