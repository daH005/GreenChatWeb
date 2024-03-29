import { JWTToken } from "../_localStorage.js";
import { redirectToLoginPage } from "../_redirects.js";
import { requestUserInfo } from "../_http.js";

if (!JWTToken.exist()) {
    redirectToLoginPage();
}

export const user = await requestUserInfo();
