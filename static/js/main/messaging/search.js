import { requestUserInfo } from "../../common/http/functions.js";
import { setInputAsInvalidAndNotifyWithThrow, removeInvalidClassForAllInputs } from "../../common/inputsHighlighting.js";
import { thisUser } from "../../common/thisUser.js";
import { HTMLPrivateRealChat } from "./privateRealChat.js";
import { privateFakeChat } from "./privateFakeChat.js";
const searchInputEl = document.getElementById("js-search-input");
const searchButtonEl = document.getElementById("js-search-button");
searchButtonEl.onclick = async () => {
    await searchUserAndSwitchToChat();
};
async function searchUserAndSwitchToChat() {
    removeInvalidClassForAllInputs();
    let interlocutorId = Number(searchInputEl.value);
    if (!interlocutorId) {
        setInputAsInvalidAndNotifyWithThrow(searchInputEl, "Введите нормальное число...");
    }
    if (interlocutorId == thisUser.id) {
        setInputAsInvalidAndNotifyWithThrow(searchInputEl, "Нельзя найти себя самого!");
    }
    let maybeChat = HTMLPrivateRealChat.getChatByInterlocutorId(interlocutorId);
    if (maybeChat) {
        maybeChat.open();
        return;
    }
    let interlocutor = await requestUserInfo({ userId: interlocutorId });
    if (HTMLPrivateRealChat.curOpenedChat) {
        HTMLPrivateRealChat.curOpenedChat.close();
    }
    privateFakeChat.setInterlocutor(interlocutor);
    privateFakeChat.open();
}
