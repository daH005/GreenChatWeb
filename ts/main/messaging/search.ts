import { requestUser } from "../../common/http/functions.js";
import { setInputAsInvalidAndNotifyWithThrow, removeInvalidClassForAllInputs } from "../../common/inputsHighlighting.js";
import { thisUser } from "../../common/thisUser.js";
import { User } from "../../common/apiDataInterfaces.js";
import { HTMLPrivateChat } from "./privateChat.js";

const searchInputEl: HTMLInputElement = <HTMLInputElement>document.getElementById("js-search-input");
const searchButtonEl: HTMLButtonElement = <HTMLButtonElement>document.getElementById("js-search-button");

searchButtonEl.onclick = async () => {
    await searchUserAndSwitchToChat();
}

async function searchUserAndSwitchToChat(): Promise<void> {
    removeInvalidClassForAllInputs();

    let interlocutorId: number = Number(searchInputEl.value);
    if (!interlocutorId) {
        setInputAsInvalidAndNotifyWithThrow(searchInputEl, "Введите нормальное число...")
    }

    if (interlocutorId == thisUser.id) {
        setInputAsInvalidAndNotifyWithThrow(searchInputEl, "Нельзя найти себя самого!")
    }

    let maybeChat: HTMLPrivateChat = HTMLPrivateChat.getChatByInterlocutorId(interlocutorId);
    if (maybeChat) {
        maybeChat.open();
        return;
    }

    let interlocutor: User = await requestUser(interlocutorId);

    let chat: HTMLPrivateChat = HTMLPrivateChat.newChat(interlocutor);
    await chat.init();
    await chat.open();
}
