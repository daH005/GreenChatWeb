import { userById } from "./users.js";

export async function addUserToApiData(apiData): Promise<void> {
    apiData.user = await userById(apiData.userId);
}

export async function addUsersToApiData(apiData): Promise<void> {
    apiData.users = [];
    for (let i in apiData.userIds) {
        let curId = apiData.userIds[i];
        apiData.users.push(await userById(curId));
    }
}
