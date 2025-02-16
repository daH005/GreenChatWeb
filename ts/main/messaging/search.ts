import { requestUser, requestChatByInterlocutor } from "../../common/http/functions.js";
import { setInputAsInvalidAndNotifyWithThrow, removeInvalidClassForAllInputs } from "../../common/inputsHighlighting.js";
import { CURRENT_LABELS } from "../../common/languages/labels.js";
import { thisUser } from "../../common/thisUser.js";
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

    try {
        await requestChatByInterlocutor(interlocutorId);
    } catch {
        let chat: HTMLPrivateChat = HTMLPrivateChat.new(
            await requestUser(interlocutorId),
        );
        await chat.init();
        await chat.open();
        return;
    }

    setInputAsInvalidAndNotifyWithThrow(searchInputEl, CURRENT_LABELS.chatWithThisUserExists);
}
