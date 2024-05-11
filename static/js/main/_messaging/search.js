import { requestUserInfo } from "../../_http.js";
import { setInputAsInvalidAndMessageWithThrow, removeInvalidClassForAllInputs } from "../../_common.js";
import { user } from "../_user.js";
import { Chat } from "./chat.js";
import { newFakeChat } from "./newFakeChat.js";

const searchInputEl = document.getElementById("js-search-input");
const searchButtonEl = document.getElementById("js-search-button");
searchButtonEl.onclick = () => {
    searchUserAndSwitchToChat();
}

async function searchUserAndSwitchToChat() {
    removeInvalidClassForAllInputs();

    let userId = Number(searchInputEl.value);
    if (!userId) {
        setInputAsInvalidAndMessageWithThrow(searchInputEl, "Введите нормальное число...")
    }

    if (userId == user.id) {
        setInputAsInvalidAndMessageWithThrow(searchInputEl, "Нельзя найти себя самого!")
    }

    let maybeChat = Chat.interlocutorsChats[userId];
    if (maybeChat) {
        maybeChat.open();
        return;
    }

    let interlocutorUser = await requestUserInfo({userId});
    newFakeChat.open(interlocutorUser);

}
