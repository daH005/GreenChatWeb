import { requestUserInfo } from "../_http.js";

console.log("Загружаем пользователя...");
export user = await requestUserInfo();
