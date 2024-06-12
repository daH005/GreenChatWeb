import { requestUserInfo } from "../../common/http/functions.js";
import { setInputAsInvalidAndNotifyWithThrow, removeInvalidClassForAllInputs } from "../../common/inputsHighlighting.js";
import { thisUser } from "../../common/thisUser.js";
import {User} from "../../common/apiDataInterfaces.js";
import { HTMLPrivateRealChat } from "./privateRealChat.js";
import { privateFakeChat } from "./privateFakeChat.js";

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

    let maybeChat: HTMLPrivateRealChat = <HTMLPrivateRealChat>HTMLPrivateRealChat.getChatByInterlocutorId(interlocutorId);
    if (maybeChat) {
        maybeChat.open();
        return;
    }

    let interlocutor: User = await requestUserInfo({userId: interlocutorId});

    if (HTMLPrivateRealChat.curOpenedChat) {
        HTMLPrivateRealChat.curOpenedChat.close();
    }
    privateFakeChat.setInterlocutor(interlocutor)
    privateFakeChat.open();

}
