import { updateUserInfo } from "./userInfo.js";
import { requestUserChats } from "../../_http.js";
import { user } from "../_user.js";
import { Chat } from "./chat.js";
import { newFakeChat } from "./newFakeChat.js";
import "./search.js";  // init inside module

var allChats = {};

function addChat(apiData) {
    let chat = new Chat({
        data: {
            fromApi: apiData,
        },
    });
    allChats[chat.id] = chat;
}

export const handlersForWebsocket = {
    "interlocutorsOnlineInfo": (apiData) => {
        for (let interlocutorId in apiData) {
            Chat.interlocutorsChats[interlocutorId].updateOnlineStatus(apiData[interlocutorId]);
        }
    },

    "newChat": (apiData) => {
        addChat(apiData);
        if (apiData.isGroup) {
            return;
        }
        for (let i in apiData.users) {
            if (apiData.users[i].id == newFakeChat.interlocutorUser.id) {
                Chat.interlocutorsChats[apiData.users[i].id].open();
                break;
            }
        }
    },

    "newChatMessage": (apiData) => {
        allChats[apiData.chatId].addMessage(apiData);
    },

    "newChatMessageTyping": (apiData) => {
        allChats[apiData.chatId].updateTyping(apiData);
    },
}

export async function initHtml() {
    updateUserInfo(user);

    let data = await requestUserChats();
    data.chats.reverse();
    for (let i in data.chats) {
        addChat(data.chats[i]);
    }

}
