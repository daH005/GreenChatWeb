import { requestUser,
         requestUserChats,
       } from "../../common/http/functions.js";
import { APIUser, APIChat } from "../../common/apiDataInterfaces.js";
import { AbstractHTMLChat } from "./abstractChat.js";
import { HTMLPrivateChat } from "./privateChat.js";
import { HTMLChatLink } from "./chatLink.js";

export class HTMLChatList {

    protected _el: HTMLElement = document.getElementById("js-all-chats-links");
    protected readonly _SIZE: number = 20;
    protected _currentOffset: number = 0;
    protected _requestedOffset: number = 0;

    public constructor() {
        HTMLChatLink.setParentEl(this._el);
        this._startScrollEvent();
    }

    protected _startScrollEvent(): void {
        this._el.onscroll = async () => {
            if (!this._scrolledToBottom()) {
                return;
            }
            await this._loadNext();
        }
    }

    protected _scrolledToBottom(): boolean {
        return this._el.scrollHeight - this._el.scrollTop - this._el.clientHeight < 100;
    }

    public async init(): Promise<void> {
        await this._loadNext();
    }

    protected async _loadNext(): Promise<void> {
        if (this._currentOffset < this._requestedOffset) {
            return;
        }

        this._requestedOffset += this._SIZE;
        let apiData: APIChat[] = await requestUserChats({
            offset: this._requestedOffset - this._SIZE,
            size: this._SIZE,
        });

        for (let oneApiData of apiData) {
            await this.addChat(oneApiData);
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
            await chat.addLastMessage(apiData.lastMessage, false);
        }

        this._currentOffset += 1;
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
