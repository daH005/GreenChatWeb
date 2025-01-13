import { requestUser } from "./http/functions.js";
import { User } from "./apiDataInterfaces.js";

var users: Record<number, User> = {}

export async function userById(userId: number | null = null): Promise<User> {
    if (!users[userId]) {
        users[userId] = await requestUser(userId);
    }
    return users[userId]
}
