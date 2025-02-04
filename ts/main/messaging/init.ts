import { requestUser,
         requestChat,
         requestMessage,
         requestUnreadCount,
         requestUserChats,
       } from "../../common/http/functions.js";
import { addUserToApiData } from "../../common/apiDataAdding.js";
import { thisUser } from "../../common/thisUser.js";
import { User, Chat, Message } from "../../common/apiDataInterfaces.js";
import { SignalType } from "../websocket/signalTypes.js";
import { ChatId,
         MessageId,
         Typing,
         Read,
         OnlineStatuses,
       } from "../websocket/signalInterfaces.js";
import { AbstractHTMLChat } from "./abstractChat.js";
import { HTMLPrivateChat } from "./privateChat.js";
import { HTMLMessage } from "./messages.js";
import "./search.js";

export const handlersForWebsocket = {
    [SignalType.ONLINE_STATUSES]: async (apiData: OnlineStatuses)=> {
        let chat: HTMLPrivateChat | null;
        for (let interlocutorId in apiData) {
            chat = HTMLPrivateChat.getChatByInterlocutorId(Number(interlocutorId));
            chat.updateOnlineStatus(apiData[interlocutorId]);
        }
    },

    [SignalType.NEW_CHAT]: async (apiData: ChatId) => {
        let chat: Chat = await requestChat(apiData.chatId);
        if (!chat.isGroup) {
            await addPrivateChat(chat);
        }
    },

    [SignalType.NEW_MESSAGE]: async (apiData: MessageId) => {
        let message: Message = await requestMessage(apiData.messageId);
        await AbstractHTMLChat.byId(message.chatId).addMessage(message);
    },

    [SignalType.MESSAGE_EDIT]: async (apiData: MessageId) => {
        let message: Message = await requestMessage(apiData.messageId);
        await HTMLMessage.byId(apiData.messageId).setText(message.text);
    },

    [SignalType.MESSAGE_DELETE]: async (apiData: MessageId) => {
        await HTMLMessage.byId(apiData.messageId).chat.deleteMessage(apiData.messageId);
    },

    [SignalType.FILES]: async (apiData: MessageId) => {
        await HTMLMessage.byId(apiData.messageId).resetFiles();
    },

    [SignalType.TYPING]: async (apiData: Typing) => {
        AbstractHTMLChat.byId(apiData.chatId).updateTyping(apiData);
    },

    [SignalType.NEW_UNREAD_COUNT]: async (apiData: ChatId) => {
        let unreadCount: number = await requestUnreadCount(apiData.chatId);
        AbstractHTMLChat.byId(apiData.chatId).updateUnreadCount(unreadCount);
    },

    [SignalType.READ]: async (apiData: Read) => {
        AbstractHTMLChat.byId(apiData.chatId).setMessagesAsRead(apiData.messageIds);
    },

}

async function addPrivateChat(apiData: Chat): Promise<HTMLPrivateChat> {
    let chat: HTMLPrivateChat | null = HTMLPrivateChat.getChatByInterlocutorId(apiData.interlocutorId);
    if (!chat) {
        let interlocutor: User = await requestUser(apiData.interlocutorId);
        chat = new HTMLPrivateChat(apiData.id, apiData.unreadCount, interlocutor);
        await chat.init();
    } else {
        chat.setId(apiData.id);
        await chat.setAsCreatedOnServer();
    }
    chat.showLink();

    return chat;
}

export async function initMessaging(): Promise<void> {
    let apiData: Chat[] = await requestUserChats();
    apiData = apiData.reverse();

    let chat: AbstractHTMLChat;
    for (let oneApiData of apiData) {
        if (!oneApiData.isGroup) {
            chat = await addPrivateChat(oneApiData);
        }
        if (oneApiData.lastMessage) {
            await chat.addMessage(oneApiData.lastMessage);
        }
    }
}
