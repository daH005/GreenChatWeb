import { userById } from "./users.js";
import { Message, MessageTyping, Chat } from "./apiDataInterfaces.js";

export async function addUserToApiData(apiData: Message | MessageTyping): Promise<void> {
    apiData.user = await userById(apiData.userId);
}

export async function addUsersToApiData(apiData: Chat): Promise<void> {
    apiData.users = [];
    for (let i in apiData.userIds) {
        let curId = apiData.userIds[i];
        apiData.users.push(await userById(curId));
    }
}
