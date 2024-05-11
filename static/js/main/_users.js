import { requestUserInfo } from "../_http.js";

var users = {}

export async function userFromCashById(userId) {
    if (!users[userId]) {
        users[userId] = await requestUserInfo({userId});
    }
    return users[userId];
}
