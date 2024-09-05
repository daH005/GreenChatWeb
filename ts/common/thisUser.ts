import { requestUserInfo } from "./http/functions.js";
import { User } from "./apiDataInterfaces.js"

export var thisUser: User = await requestUserInfo(null);
