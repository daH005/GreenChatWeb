import { userFromCashById } from "./_users.js";

export async function addUserToApiData(apiData) {
    apiData.user = await userFromCashById(apiData.userId);
}

export async function addUsersToApiData(apiData) {
    apiData.users = [];
    for (let i in apiData.usersIds) {
        let curId = apiData.usersIds[i];
        apiData.users.push(await userFromCashById(curId));
    }
}
