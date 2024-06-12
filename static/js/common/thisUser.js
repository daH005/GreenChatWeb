import { JWT } from "./localStorage.js";
import { redirectToLoginPage } from "./redirects.js";
import { requestUserInfo } from "./http/functions.js";
if (!JWT.exist()) {
    redirectToLoginPage();
}
export var thisUser = await requestUserInfo(null);
