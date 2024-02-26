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

            let chat = AbstractChat.interlocutorsChats[interlocutorId];
            if (!chat || chat == newFakeChat) {
                interlocutorsOnlineStatusesForUncreatedChats[interlocutorId] = apiData[interlocutorId];
            }

            if (chat) {
                AbstractChat.interlocutorsChats[interlocutorId].updateOnlineStatus(apiData[interlocutorId]);
            }

        }
    },

    "newChat": async (apiData) => {
        let chat = await addChat(apiData);

        if (apiData.isGroup || !newFakeChat.interlocutorUser) {
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

var interlocutorsOnlineStatusesForUncreatedChats = {};

var allChats = {};

async function addChat(apiData) {
    await addUsersToApiData(apiData);
    await addUserToApiData(apiData.lastMessage);

    let chat = new Chat({
        data: {
            fromApi: apiData,
        },
    });

    let onlineStatus = interlocutorsOnlineStatusesForUncreatedChats[chat.interlocutorUser.id];
    chat.updateOnlineStatus(onlineStatus);

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
