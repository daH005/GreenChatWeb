import { requestUserInfo } from "./http/functions.js";
export var thisUser = await requestUserInfo(null);
