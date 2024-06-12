import { requestUserChats } from "../../common/http/functions.js";
import { addUserToApiData, addUsersToApiData } from "../../common/apiDataAdding.js";
import { thisUser } from "../../common/thisUser.js";
import { User, InterlocutorsOnlineStatuses, Chat, ChatMessage, ChatMessageTyping, NewUnreadCount, ReadChatMessagesIds } from "../../common/apiDataInterfaces.js";
import { WebSocketMessageType } from "../websocket/messageTypes.js";
import { HTMLPrivateRealChat } from "./privateRealChat.js";
import { privateFakeChat } from "./privateFakeChat.js";
import "./search.js";

var interlocutorsOnlineStatusesForUncreatedChats: Record<number, boolean> = {};
var allChats: Record<number, HTMLPrivateRealChat> = {};

export const handlersForWebsocket: Partial<Record<WebSocketMessageType, Function>> = {
    [WebSocketMessageType.INTERLOCUTORS_ONLINE_STATUSES]: async (apiData: InterlocutorsOnlineStatuses): Promise<void> => {
        for (let interlocutorId in apiData) {
            if (privateFakeChat.isOpenedWith(Number(interlocutorId))) {
                privateFakeChat.updateOnlineStatus(apiData[interlocutorId]);
                interlocutorsOnlineStatusesForUncreatedChats[interlocutorId] = apiData[interlocutorId];
                return;
            }

            let chat: HTMLPrivateRealChat | null = HTMLPrivateRealChat.getChatByInterlocutorId(Number(interlocutorId));
            if (chat) {
                chat.updateOnlineStatus(apiData[interlocutorId]);
            }

        }
    },

    [WebSocketMessageType.NEW_CHAT]: async (apiData: Chat): Promise<void> => {
        let chat = await addChat(apiData);

        if (apiData.isGroup) {
            return;
        }
        if (privateFakeChat.isOpenedWith(apiData.interlocutor.id)) {
            chat.open();
        }
    },

    [WebSocketMessageType.NEW_CHAT_MESSAGE]: async (apiData: ChatMessage): Promise<void> => {
        await addUserToApiData(apiData);
        allChats[apiData.chatId].addMessage(apiData);
    },

    [WebSocketMessageType.NEW_CHAT_MESSAGE_TYPING]: async (apiData: ChatMessageTyping): Promise<void> => {
        await addUserToApiData(apiData);
        allChats[apiData.chatId].updateTyping(apiData);
    },

    [WebSocketMessageType.NEW_UNREAD_COUNT]: async (apiData: NewUnreadCount): Promise<void> => {
        allChats[apiData.chatId].updateUnreadCount(apiData.unreadCount);
    },

    [WebSocketMessageType.READ_CHAT_MESSAGES]: async (apiData: ReadChatMessagesIds): Promise<void> => {
        allChats[apiData.chatId].setMessagesAsRead(apiData.chatMessagesIds);
    },

}

function defineInterlocutor(users: User[]): User {
    for (let user of users) {
        if (user.id != thisUser.id) {
            return user;
        }
    }
}

async function addChat(apiData: Chat): Promise<HTMLPrivateRealChat> {
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

export async function initMessaging(): Promise<void> {
    let data = await requestUserChats();
    data.chats.reverse();
    for (let i in data.chats) {
        await addChat(data.chats[i]);
    }

}
