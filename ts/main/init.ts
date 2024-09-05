import { thisUser } from "../common/thisUser.js";
import { initMessaging, handlersForWebsocket } from "./messaging/init.js";
import { initWebSocket } from "./websocket/init.js";
import { updateUserInfo } from "./thisUserInfo.js";
import { updateBackground } from "./background.js";
import "./thisUserSettings.js";

await updateUserInfo(thisUser);
await updateBackground();
await initMessaging();
initWebSocket(handlersForWebsocket);
