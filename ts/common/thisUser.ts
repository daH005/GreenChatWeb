import { JWT } from "./localStorage.js";
import { redirectToLoginPage } from "./redirects.js";
import { requestUserInfo } from "./http/functions.js";
import { User } from "./apiDataInterfaces.js"

if (!JWT.exist()) {
    redirectToLoginPage();
}

export var thisUser: User = await requestUserInfo(null);
