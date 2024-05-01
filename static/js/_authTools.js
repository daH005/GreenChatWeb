import { BASE_HEADERS } from "./_config.js";
import { JWT } from "./_localStorage.js";
import { redirectToMainPage } from "./_redirects.js";

export function makeAuthHeaders() {
    return {
        ...BASE_HEADERS,
        Authorization: `Bearer ${JWT.get()}`,
    }
}

export function saveJWTAndRedirect(token) {
    JWT.set(token);
    redirectToMainPage();
}
