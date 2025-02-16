import { requestUser } from "../../common/http/functions.js";
import { setInputAsInvalidAndNotifyWithThrow, removeInvalidClassForAllInputs } from "../../common/inputsHighlighting.js";
import { CURRENT_LABELS } from "../../common/languages/labels.js";
import { thisUser } from "../../common/thisUser.js";
import { APIUser } from "../../common/apiDataInterfaces.js";
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
        setInputAsInvalidAndNotifyWithThrow(searchInputEl, CURRENT_LABELS.inputUserId)
    }

    if (interlocutorId == thisUser.id) {
        setInputAsInvalidAndNotifyWithThrow(searchInputEl, CURRENT_LABELS.invalidSelfUserId)
    }

    let maybeChat: HTMLPrivateChat = HTMLPrivateChat.byInterlocutorId(interlocutorId);
    if (maybeChat) {
        maybeChat.open();
        return;
    }

    let interlocutor: APIUser = await requestUser(interlocutorId);

    let chat: HTMLPrivateChat = HTMLPrivateChat.new(interlocutor);
    await chat.init();
    await chat.open();
}
