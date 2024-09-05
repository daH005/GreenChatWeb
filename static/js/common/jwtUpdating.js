import { JWT_TOKEN_REFRESH_INTERVAL_DELAY } from "../config.js";
import { requestNewJWT } from "./http/functions.js";
export async function initJWTUpdating() {
    await updateJWT();
    setInterval(async () => {
        await updateJWT();
    }, JWT_TOKEN_REFRESH_INTERVAL_DELAY);
}
async function updateJWT() {
    await requestNewJWT();
    console.log("Токен обновлён!");
}
