import { SITE_URLS } from "./siteEndpoints.js";
export function redirectToLoginPage() {
    window.location.href = SITE_URLS.LOGIN;
}
export function redirectToMainPage() {
    window.location.href = SITE_URLS.MAIN;
}
