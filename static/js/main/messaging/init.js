import { requestUserChats } from "../../common/http/functions.js";
import { addUserToApiData, addUsersToApiData } from "../../common/apiDataAdding.js";
import { thisUser } from "../../common/thisUser.js";
import { WebSocketMessageType } from "../websocket/messageTypes.js";
import { HTMLPrivateRealChat } from "./privateRealChat.js";
import { privateFakeChat } from "./privateFakeChat.js";
import "./search.js";
var interlocutorsOnlineStatusesForUncreatedChats = {};
var allChats = {};
export const handlersForWebsocket = {
    [WebSocketMessageType.INTERLOCUTORS_ONLINE_STATUSES]: async (apiData) => {
        for (let interlocutorId in apiData) {
            let chat = HTMLPrivateRealChat.getChatByInterlocutorId(Number(interlocutorId));
            if (!chat || privateFakeChat.isOpened) {
                interlocutorsOnlineStatusesForUncreatedChats[interlocutorId] = apiData[interlocutorId];
            }
            if (chat) {
                chat.updateOnlineStatus(apiData[interlocutorId]);
            }
        }
    },
    [WebSocketMessageType.NEW_CHAT]: async (apiData) => {
        let chat = await addChat(apiData);
        if (apiData.isGroup) {
            return;
        }
        if (privateFakeChat.isOpenedWith(apiData.interlocutor.id)) {
            chat.open();
        }
    },
    [WebSocketMessageType.NEW_CHAT_MESSAGE]: async (apiData) => {
        await addUserToApiData(apiData);
        allChats[apiData.chatId].addMessage(apiData);
    },
    [WebSocketMessageType.NEW_CHAT_MESSAGE_TYPING]: async (apiData) => {
        await addUserToApiData(apiData);
        allChats[apiData.chatId].updateTyping(apiData);
    },
    [WebSocketMessageType.NEW_UNREAD_COUNT]: async (apiData) => {
        allChats[apiData.chatId].updateUnreadCount(apiData.unreadCount);
    },
    [WebSocketMessageType.READ_CHAT_MESSAGES]: async (apiData) => {
        allChats[apiData.chatId].setMessagesAsRead(apiData.chatMessagesIds);
    },
};
function defineInterlocutor(users) {
    for (let user of users) {
        if (user.id != thisUser.id) {
            return user;
        }
    }
}
async function addChat(apiData) {
    await addUsersToApiData(apiData);
    await addUserToApiData(apiData.lastMessage);
    apiData.interlocutor = defineInterlocutor(apiData.users);
    let chat = new HTMLPrivateRealChat(apiData.id, apiData.lastMessage, apiData.users, apiData.unreadCount, apiData.interlocutor);
    chat.init();
    let onlineStatus = interlocutorsOnlineStatusesForUncreatedChats[apiData.interlocutor.id];
    if (onlineStatus) {
        chat.updateOnlineStatus(onlineStatus);
    }
    allChats[chat.id] = chat;
    return chat;
}
export async function initMessaging() {
    let data = await requestUserChats();
    data.chats.reverse();
    for (let i in data.chats) {
        await addChat(data.chats[i]);
    }
}
