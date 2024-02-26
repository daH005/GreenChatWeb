import { requestUserInfo } from "../_http.js";

var interlocutors = {}

export async function interlocutorInfoById(id) {
    if (!interlocutors[id]) {
        interlocutors[id] = await requestUserInfo({id});
    }
    return interlocutors[id];
}
