import { JWT_TOKEN_REFRESH_INTERVAL_DELAY } from "../config.js";
import { requestNewJWT } from "./http/functions.js";
import { JWT } from "./localStorage.js";

export async function initJWTUpdating(): Promise<void> {
    await updateJWT();
    setInterval(async () => {
        await updateJWT();
    }, JWT_TOKEN_REFRESH_INTERVAL_DELAY);
}

async function updateJWT(): Promise<void> {
    let data = await requestNewJWT();
    JWT.set(data.JWT);
    console.log("Токен обновлён!");
}
