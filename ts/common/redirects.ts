import { THIS_SITE_URLS } from "./thisSiteUrls.js";

export function redirectToLoginPage(): void {
    window.location.href = THIS_SITE_URLS.LOGIN;
}

export function redirectToMainPage(): void {
    window.location.href = THIS_SITE_URLS.MAIN;
}
