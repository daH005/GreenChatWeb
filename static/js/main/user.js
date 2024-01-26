import { requestUserInfo } from "../_http.js";

console.log("Загружаем пользователя...");
export const user = await requestUserInfo();
