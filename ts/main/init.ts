import { thisUser } from "../common/thisUser.js";
import { websocketHandlers } from "./messaging/websocketHandlers.js";
import { chatList } from "./messaging/chatList.js";
import { initWebSocket } from "./websocket/init.js";
import { updateUser } from "./thisUser.js";
import { updateBackground } from "./background.js";
import "./thisUserSettings.js";
import "./quit.js";

await updateUser(thisUser);
await updateBackground();
await chatList.init();
initWebSocket(websocketHandlers);
