import { requestUser } from "./http/functions.js";

export async function addUserToApiData(apiData): Promise<void> {
    apiData.user = await requestUser(apiData.userId);
}

export async function addUsersToApiData(apiData): Promise<void> {
    apiData.users = [];
    for (let userId of apiData.userIds) {
        apiData.users.push(await requestUser(userId));
    }
}
