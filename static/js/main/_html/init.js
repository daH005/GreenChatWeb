import { updateUserInfo } from "./userInfo.js";
import { requestUserChats } from "../../_http.js";
import { user } from "../_user.js";
import { addUserToApiData, addUsersToApiData } from "../_apiDataAdding.js";
import { Chat } from "./chat.js";
import { AbstractChat } from "./absChat.js";
import { newFakeChat } from "./newFakeChat.js";
import "./search.js";  // init inside module

export const handlersForWebsocket = {
    "interlocutorsOnlineStatuses": async (apiData) => {
        for (let interlocutorId in apiData) {

            // Может быть так, что объект `Chat` ещё не сформирован, а данные уже пришли.
            // Делаем такую паузу.
            // FixMe: Изменить, если появятся идеи.
            let waitForChatHtmlCreating = 0;
            if (!AbstractChat.interlocutorsChats[interlocutorId]) {
                waitForChatHtmlCreating = 1000;
            }

            setTimeout(() => {
                AbstractChat.interlocutorsChats[interlocutorId].updateOnlineStatus(apiData[interlocutorId]);
            }, waitForChatHtmlCreating);
        }
    },

    "newChat": async (apiData) => {
        let chat = await addChat(apiData);

        if (apiData.isGroup) {
            return;
        }
        if (chat.interlocutorUser.id == newFakeChat.interlocutorUser.id) {
            chat.open();
        }
    },

    "newChatMessage": async (apiData) => {
        await addUserToApiData(apiData);
        allChats[apiData.chatId].addMessage(apiData);
    },

    "newChatMessageTyping": async (apiData) => {
        await addUserToApiData(apiData);
        allChats[apiData.chatId].updateTyping(apiData);
    },
}

var allChats = {};

async function addChat(apiData) {
    await addUsersToApiData(apiData);
    await addUserToApiData(apiData.lastMessage);

    let chat = new Chat({
        data: {
            fromApi: apiData,
        },
    });
    allChats[chat.id] = chat;

    return chat;
}

export async function initHtml() {
    updateUserInfo(user);

    let data = await requestUserChats();
    data.chats.reverse();
    for (let i in data.chats) {
        await addChat(data.chats[i]);
    }

}
