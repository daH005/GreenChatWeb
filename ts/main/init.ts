import { thisUser } from "../common/thisUser.js";
import { initMessaging, handlersForWebsocket } from "./messaging/init.js";
import { initJWTUpdating } from "../common/jwtUpdating.js";
import { initWebSocket } from "./websocket/init.js";
import { updateUserInfo } from "./thisUserInfo.js";
import "./thisUserSettings.js";

await updateUserInfo(thisUser);
await initJWTUpdating()
await initMessaging();
initWebSocket(handlersForWebsocket);
