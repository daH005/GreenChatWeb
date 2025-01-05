import { userById } from "./users.js";
import { ChatMessage, ChatMessageTyping, Chat } from "./apiDataInterfaces.js";

export async function addUserToApiData(apiData: ChatMessage | ChatMessageTyping): Promise<void> {
    apiData.user = await userById(apiData.userId);
}

export async function addUsersToApiData(apiData: Chat): Promise<void> {
    apiData.users = [];
    for (let i in apiData.userIds) {
        let curId = apiData.userIds[i];
        apiData.users.push(await userById(curId));
    }
}
