import { JWT } from "../_localStorage.js";
import { redirectToLoginPage } from "../_redirects.js";
import { requestUserInfo } from "../_http.js";

if (!JWT.exist()) {
    redirectToLoginPage();
}

export const user = await requestUserInfo();
