import { SITE_URLS } from "./siteEndpoints.js";

export function redirectToLoginPage(): void {
    window.location.href = SITE_URLS.LOGIN;
}

export function redirectToMainPage(): void {
    window.location.href = SITE_URLS.MAIN;
}
