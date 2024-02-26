import { requestUserInfo } from "../_http.js";

var users = {}

export async function userFromCashById(id) {
    if (!users[id]) {
        users[id] = await requestUserInfo({id});
    }
    return users[id];
}
