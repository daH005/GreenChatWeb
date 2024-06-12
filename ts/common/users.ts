import { requestUserInfo } from "./http/functions.js";
import { User } from "./apiDataInterfaces.js";

var users: Record<number, User> = {}

export async function userById(userId: number): Promise<User> {
    if (!users[userId]) {
        users[userId] = await requestUserInfo({userId});
    }
    return users[userId];
}
