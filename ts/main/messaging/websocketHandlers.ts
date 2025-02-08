import { requestChat,
         requestMessage,
         requestUnreadCount,
       } from "../../common/http/functions.js";
import { thisUser } from "../../common/thisUser.js";
import { Chat, Message } from "../../common/apiDataInterfaces.js";
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
import { chatList } from "./chatList.js";
import "./search.js";

export const websocketHandlers = {
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
            await chatList.addPrivateChat(chat);
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
