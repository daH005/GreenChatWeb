import { requestUser,
         requestUserChats,
       } from "../../common/http/functions.js";
import { APIUser, APIChat } from "../../common/apiDataInterfaces.js";
import { AbstractHTMLChat } from "./abstractChat.js";
import { HTMLPrivateChat } from "./privateChat.js";
import { HTMLChatLink } from "./chatLink.js";

export class HTMLChatList {
    protected _el: HTMLElement = document.getElementById("js-all-chats-links");

    public constructor() {
        HTMLChatLink.setParentEl(this._el);
    }

    public async init(): Promise<void> {
        let apiData: APIChat[] = await requestUserChats();
        // The reversing is necessary for the correct sorting of the chats after `ChatLink.updateTextAndDate`.
        apiData = apiData.reverse();

        for (let oneApiData of apiData) {
            this.addChat(oneApiData);
        }
    }

    public async addChat(apiData: APIChat): Promise<AbstractHTMLChat> {
        let chat: AbstractHTMLChat;
        if (!apiData.isGroup) {
            chat = await this._addPrivateChat(apiData);
        } else {
            // chat = await this._addGroupChat(apiData);
        }

        if (apiData.lastMessage) {
            await chat.addMessage(apiData.lastMessage);
        }

        return chat;
    }

    protected async _addPrivateChat(apiData: APIChat): Promise<HTMLPrivateChat> {
        let chat: HTMLPrivateChat | null = HTMLPrivateChat.byInterlocutorId(apiData.interlocutorId);
        if (!chat) {
            let interlocutor: APIUser = await requestUser(apiData.interlocutorId);
            chat = new HTMLPrivateChat(apiData.id, apiData.unreadCount, interlocutor);
            await chat.init();
        } else {
            chat.setId(apiData.id);
            await chat.setAsCreatedOnServer();
        }
        chat.showLink();

        return chat;
    }

    // protected async _addGroupChat(apiData: APIChat): {}  // Will be implemented in the future

}

export const chatList = new HTMLChatList();
