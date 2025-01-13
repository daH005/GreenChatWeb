import { requestUser } from "./http/functions.js";
import { User } from "./apiDataInterfaces.js";

var users: Record<number, User> = {}

export async function userById(userId: number | null = null): Promise<User> {
    if (users[userId]) {
        return users[userId];
    }

    let args;
    if (userId) {
        args = {userId};
    } else {
        args = null;
    }
    let user = await requestUser(args);
    users[user.id] = user;
    return user;
}
