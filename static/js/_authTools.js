import { JWT } from "./_localStorage.js";
import { redirectToMainPage } from "./_redirects.js";

export function makeAuthHeaders() {
    return {
        Authorization: `Bearer ${JWT.get()}`,
    }
}

export function saveJWTAndRedirect(token) {
    JWT.set(token);
    redirectToMainPage();
}
