import { requestUser,
         requestUserChats,
       } from "../../common/http/functions.js";
import { User, Chat } from "../../common/apiDataInterfaces.js";
import { AbstractHTMLChat } from "./abstractChat.js";
import { HTMLPrivateChat } from "./privateChat.js";
import { HTMLChatLink } from "./chatLink.js";

export class HTMLChatList {
    protected _el: HTMLElement = document.getElementById("js-all-chats-links");

    public constructor() {
        HTMLChatLink.setParentEl(this._el);
    }

    public async init(): Promise<void> {
        let apiData: Chat[] = await requestUserChats();
        // The reversing is necessary for the correct sorting of the chats after `ChatLink.updateTextAndDate`.
        apiData = apiData.reverse();

        let chat: AbstractHTMLChat;
        for (let oneApiData of apiData) {
            if (!oneApiData.isGroup) {
                chat = await this.addPrivateChat(oneApiData);
            }
            if (oneApiData.lastMessage) {
                await chat.addMessage(oneApiData.lastMessage);
            }
        }
    }

    public async addPrivateChat(apiData: Chat): Promise<HTMLPrivateChat> {
        let chat: HTMLPrivateChat | null = HTMLPrivateChat.byInterlocutorId(apiData.interlocutorId);
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

}

export const chatList = new HTMLChatList();
