import { sleep } from "../../common/sleep.js";
import { requestChat,
         requestMessage,
       } from "../../common/http/functions.js";
import { thisUser } from "../../common/thisUser.js";
import { APIChat, APIMessage } from "../../common/apiDataInterfaces.js";
import { SignalType } from "../websocket/signalTypes.js";
import { ChatSignal,
         MessageSignal,
         TypingSignal,
         ReadSignal,
         OnlineStatusesSignal,
       } from "../websocket/signalInterfaces.js";
import { AbstractHTMLChat } from "./abstractChat.js";
import { HTMLPrivateChat } from "./privateChat.js";
import { HTMLMessage } from "./messages.js";
import { chatList } from "./chatList.js";
import "./search.js";

export const websocketHandlers = {
    [SignalType.ONLINE_STATUSES]: async (signal: OnlineStatusesSignal)=> {
        let chat: HTMLPrivateChat | null;
        for (let interlocutorId in signal) {
            chat = HTMLPrivateChat.byInterlocutorId(Number(interlocutorId));
            if (!chat) {
                continue;
            }
            chat.updateOnlineStatus(signal[interlocutorId]);
        }
    },

    [SignalType.NEW_CHAT]: async (signal: ChatSignal) => {
        let apiChat: APIChat = await requestChat(signal.chatId);
        await chatList.addChat(apiChat);
    },

    [SignalType.NEW_MESSAGE]: async (signal: MessageSignal) => {
        let chat: AbstractHTMLChat | null = AbstractHTMLChat.byId(signal.chatId);
        if (!chat) {
            chat = await chatList.addChat(
                await requestChat(signal.chatId),
            );
        }
        await chat.updateLastMessageAsNew();
        await chat.updateUnreadCount();
    },

    [SignalType.MESSAGE_EDIT]: async (signal: MessageSignal) => {
        let message: HTMLMessage | null = HTMLMessage.byId(signal.messageId);
        if (message) {  // Message may be is not created in the current section.
            let apiMessage: APIMessage = await requestMessage(signal.messageId);
            message.chat.updateMessageText(apiMessage.id, apiMessage.text);
        }
    },

    [SignalType.MESSAGE_DELETE]: async (signal: MessageSignal) => {
        let message: HTMLMessage | null = HTMLMessage.byId(signal.messageId);
        if (message) {  // Message may be is not created in the current section.
            await message.chat.deleteMessage(signal.messageId);
        }
        await AbstractHTMLChat.byId(signal.chatId).updateUnreadCount();
    },

    [SignalType.FILES]: async (signal: MessageSignal) => {
        let message: HTMLMessage | null = HTMLMessage.byId(signal.messageId);
        if (message) {
            await message.resetFiles();
        } else {
            // This signal may be received earlier than the message is created in HTML => wait for that.
            await sleep(10);
            await websocketHandlers[SignalType.FILES](signal);
        }
    },

    [SignalType.TYPING]: async (signal: TypingSignal) => {
        let chat: AbstractHTMLChat | null = AbstractHTMLChat.byId(signal.chatId);
        if (chat) {  // Chat may be is not created in the current scroll position in the sidebar.
            await chat.updateTyping(signal.userId);
        }
    },

    [SignalType.NEW_UNREAD_COUNT]: async (signal: ChatSignal) => {
        let chat: AbstractHTMLChat | null = AbstractHTMLChat.byId(signal.chatId);
        if (chat) {  // Chat may be is not created in the current scroll position in the sidebar.
            await chat.updateUnreadCount();
        }
    },

    [SignalType.READ]: async (signal: ReadSignal) => {
        let chat: AbstractHTMLChat | null = AbstractHTMLChat.byId(signal.chatId);
        if (chat) {  // Chat may be is not created in the current scroll position in the sidebar.
            chat.setMessagesAsRead(signal.messageIds);
        }
    },

}
