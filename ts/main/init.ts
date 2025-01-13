import { thisUser } from "../common/thisUser.js";
import { initMessaging, handlersForWebsocket } from "./messaging/init.js";
import { initWebSocket } from "./websocket/init.js";
import { updateUser } from "./thisUser.js";
import { updateBackground } from "./background.js";
import "./thisUserSettings.js";
import "./quit.js";

await updateUser(thisUser);
await updateBackground();
await initMessaging();
initWebSocket(handlersForWebsocket);
