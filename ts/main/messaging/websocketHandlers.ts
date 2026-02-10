import { sleep } from "../../common/sleep.js";
import { requestChat,
         requestMessage,
         requestUnreadCount,
       } from "../../common/http/functions.js";
import { thisUser } from "../../common/thisUser.js";
import { APIChat, APIMessage } from "../../common/apiDataInterfaces.js";
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
            chat = HTMLPrivateChat.byInterlocutorId(Number(interlocutorId));
            if (!chat) {
                continue;
            }
            chat.updateOnlineStatus(apiData[interlocutorId]);
        }
    },

    [SignalType.NEW_CHAT]: async (apiData: ChatId) => {
        let apiChat: APIChat = await requestChat(apiData.chatId);
        await chatList.addChat(apiChat);
    },

    [SignalType.NEW_MESSAGE]: async (apiData: MessageId) => {
        let apiMessage: APIMessage = await requestMessage(apiData.messageId);
        let chat: AbstractHTMLChat | null = AbstractHTMLChat.byId(apiMessage.chatId);
        if (!chat) {
            chat = await chatList.addChat(
                await requestChat(apiMessage.chatId),
            );
        }
        await chat.updateLastMessageAsNew();
    },

    [SignalType.MESSAGE_EDIT]: async (apiData: MessageId) => {
        let apiMessage: APIMessage = await requestMessage(apiData.messageId);
        let message: HTMLMessage | null = HTMLMessage.byId(apiMessage.id);
        if (message) {  // Message may be is not created in the current section.
            message.chat.updateMessageText(apiMessage.id, apiMessage.text);
        }
    },

    [SignalType.MESSAGE_DELETE]: async (apiData: MessageId) => {
        let message: HTMLMessage | null = HTMLMessage.byId(apiData.messageId);
        if (message) {  // Message may be is not created in the current section.
            await message.chat.deleteMessage(apiData.messageId);
        }
    },

    [SignalType.FILES]: async (apiData: MessageId) => {
        let message: HTMLMessage | null = HTMLMessage.byId(apiData.messageId);
        if (message) {
            await message.resetFiles();
        } else {
            // This signal may be received earlier than the message is created in HTML => wait for that.
            await sleep(10);
            await websocketHandlers[SignalType.FILES](apiData);
        }
    },

    [SignalType.TYPING]: async (apiData: Typing) => {
        let chat: AbstractHTMLChat | null = AbstractHTMLChat.byId(apiData.chatId);
        if (chat) {  // Chat may be is not created in the current scroll position in the sidebar.
            await chat.updateTyping(apiData);
        }
    },

    [SignalType.NEW_UNREAD_COUNT]: async (apiData: ChatId) => {
        let chat: AbstractHTMLChat | null = AbstractHTMLChat.byId(apiData.chatId);
        if (chat) {  // Chat may be is not created in the current scroll position in the sidebar.
            let unreadCount: number = await requestUnreadCount(apiData.chatId);
            chat.updateUnreadCount(unreadCount);
        }
    },

    [SignalType.READ]: async (apiData: Read) => {
        let chat: AbstractHTMLChat | null = AbstractHTMLChat.byId(apiData.chatId);
        if (chat) {  // Chat may be is not created in the current scroll position in the sidebar.
            chat.setMessagesAsRead(apiData.messageIds);
        }
    },

}
