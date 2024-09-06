import { THIS_SITE_URLS } from "./thisSiteUrls.js";
export function redirectToLoginPage() {
    window.location.href = THIS_SITE_URLS.LOGIN;
}
export function redirectToMainPage() {
    window.location.href = THIS_SITE_URLS.MAIN;
}
