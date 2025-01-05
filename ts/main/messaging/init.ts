import { requestUserChats } from "../../common/http/functions.js";
import { addUserToApiData, addUsersToApiData } from "../../common/apiDataAdding.js";
import { thisUser } from "../../common/thisUser.js";
import { userById } from "../../common/users.js";
import { User, InterlocutorsOnlineStatuses, Chat, ChatMessage, ChatMessageTyping, NewUnreadCount, ReadChatMessagesIds } from "../../common/apiDataInterfaces.js";
import { WebSocketMessageType } from "../websocket/messageTypes.js";
import { HTMLPrivateChat } from "./privateChat.js";
import { AbstractHTMLChat } from "./abstractChat.js";
import "./search.js";

export const handlersForWebsocket: Partial<Record<WebSocketMessageType, Function>> = {
    [WebSocketMessageType.INTERLOCUTORS_ONLINE_STATUSES]: async (apiData: InterlocutorsOnlineStatuses): Promise<void> => {
        let chat: HTMLPrivateChat | null;
        for (let interlocutorId in apiData) {
            chat = HTMLPrivateChat.getChatByInterlocutorId(Number(interlocutorId));
            chat.updateOnlineStatus(apiData[interlocutorId]);
        }
    },

    [WebSocketMessageType.NEW_CHAT]: async (apiData: Chat): Promise<void> => {
        if (!apiData.isGroup) {
            await addPrivateChat(apiData);
        }
    },

    [WebSocketMessageType.NEW_CHAT_MESSAGE]: async (apiData: ChatMessage): Promise<void> => {
        await addUserToApiData(apiData);
        AbstractHTMLChat.getChatById(apiData.chatId).addMessage(apiData);
    },

    [WebSocketMessageType.NEW_CHAT_MESSAGE_TYPING]: async (apiData: ChatMessageTyping): Promise<void> => {
        await addUserToApiData(apiData);
        AbstractHTMLChat.getChatById(apiData.chatId).updateTyping(apiData);
    },

    [WebSocketMessageType.NEW_UNREAD_COUNT]: async (apiData: NewUnreadCount): Promise<void> => {
        AbstractHTMLChat.getChatById(apiData.chatId).updateUnreadCount(apiData.unreadCount);
    },

    [WebSocketMessageType.READ_CHAT_MESSAGES]: async (apiData: ReadChatMessagesIds): Promise<void> => {
        AbstractHTMLChat.getChatById(apiData.chatId).setMessagesAsRead(apiData.chatMessageIds);
    },

}

async function addPrivateChat(apiData: Chat): Promise<HTMLPrivateChat> {
    let interlocutorId = defineInterlocutorId(apiData.userIds);

    let chat: HTMLPrivateChat | null = HTMLPrivateChat.getChatByInterlocutorId(interlocutorId);

    if (!chat) {
        let interlocutor: User = await userById(interlocutorId);
        chat = new HTMLPrivateChat(apiData.id, apiData.unreadCount, interlocutor);
        await chat.init();
    } else {
        chat.setId(apiData.id);
        await chat.setAsCreatedOnServer();
    }
    chat.showLink();

    return chat;
}

function defineInterlocutorId(userIds: number[]): number {
    for (let id of userIds) {
        if (id != thisUser.id) {
            return id;
        }
    }
}

export async function initMessaging(): Promise<void> {
    let data = await requestUserChats();
    data.chats.reverse();

    let chat: AbstractHTMLChat;
    for (let i in data.chats) {
        if (!data.chats[i].isGroup) {
            chat = await addPrivateChat(data.chats[i]);

            if (data.chats[i].lastMessage) {
                await addUserToApiData(data.chats[i].lastMessage);
                await chat.addMessage(data.chats[i].lastMessage);
            }
        }
    }
}
