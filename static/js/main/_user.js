import { JWTTokenExist } from "../_localStorage.js";
import { redirectToLoginPage } from "../_redirects.js";
import { requestUserInfo } from "../_http.js";

if (!JWTTokenExist()) {
    redirectToLoginPage();
}

export const user = await requestUserInfo();
