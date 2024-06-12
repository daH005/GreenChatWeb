import { requestUserInfo } from "./http/functions.js";
var users = {};
export async function userById(userId) {
    if (!users[userId]) {
        users[userId] = await requestUserInfo({ userId });
    }
    return users[userId];
}
