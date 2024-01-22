import { OUR_ENDPOINTS_URLS } from "./_config.js";

export function redirectToLoginPage() {
    window.location.href = OUR_ENDPOINTS_URLS.LOGIN;
}

export function redirectToMainPage() {
    window.location.href = OUR_ENDPOINTS_URLS.MAIN;
}
