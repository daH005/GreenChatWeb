import { BASE_HEADERS } from "./_config.js";
import { JWTToken } from "./_localStorage.js";
import { redirectToMainPage } from "./_redirects.js";

export function makeAuthHeaders() {
    return {
        ...BASE_HEADERS,
        Authorization: `Bearer ${JWTToken.get()}`,
    }
}

export function saveJWTTokenAndRedirect(token) {
    JWTToken.set(token);
    redirectToMainPage();
}
