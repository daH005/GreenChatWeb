import { User, ChatMessage, ChatMessageTyping } from "../../common/apiDataInterfaces.js";
import { choose } from "../../common/random.js";
import { thisUser } from "../../common/thisUser.js";
import { userInWindow } from "../../common/userInWindowChecking.js";
import { newMessageSound } from "../../common/audio.js";
import { requestChatHistory } from "../../common/http/functions.js";
import { addUserToApiData } from "../../common/apiDataAdding.js";
import { sendWebSocketMessage } from "../websocket/init.js";
import { WebSocketMessageType } from "../websocket/messageTypes.js";
import { dateToDateStr, normalizeDateTimezone } from "../datetime.js";
import { HTMLChatLink } from "./chatLink.js";
import { HTMLDateSep } from "./dateSep.js";
import { HTMLChatMessage, HTMLChatMessageFromThisUser } from "./chatMessages.js";
import { sendMessageToWebSocketAndClearInput } from "./websocketFunctions.js";
import { AbstractHTMLChat } from "./abstractChat.js";
import { privateFakeChat } from "./privateFakeChat.js";

export abstract class AbstractHTMLRealChat extends AbstractHTMLChat {

    protected static _curOpenedChat: AbstractHTMLRealChat = null;
    protected _messagesEl: HTMLElement;
    protected _typingEl: HTMLElement;

    protected _messages: Record<number, HTMLChatMessage>;
    protected _fullyLoaded: boolean = false;
    protected _datesSeps: Record<number, HTMLDateSep> = {};
    protected _link: HTMLChatLink;
    protected _topDateStr: string | null = null;
    protected _bottomDateStr: string | null = null;
    protected _typingTimeoutId: number | null = null;

    protected readonly _WAITING_FOR_CHAT_LOADING: number = 30;
    protected readonly _PHRASES: string[] = [
        "Что же написать...",
        "Хм...",
        "Короче, да...",
        "В общем и целом...",
        "Ваше слово?",
        "Впиши в меня текст!",
        "Наполни меня текстом!",
    ];

    protected _id: number;
    protected _name: string;
    protected _lastMessage: ChatMessage;
    protected _users: User[];
    protected _unreadCount: number;

    public constructor(id: number, name: string, lastMessage: ChatMessage, users: User[], unreadCount: number, interlocutor: User | null = null) {
        super(interlocutor);
        this._id = id;
        this._name = name;
        this._lastMessage = lastMessage;
        this._users = users;
        this._unreadCount = unreadCount;

        this._messages = {};
        this._datesSeps = {};
    }

    public static get curOpenedChat(): AbstractHTMLRealChat | null {
        return this._curOpenedChat;
    }

    public get id(): number {
        return this._id;
    }

    protected _initChildEls(): void {
        super._initChildEls();
        this._nameEl.textContent = this._name;

        this._messagesEl = this._thisEl.querySelector(".chat__messages");
        this._messagesEl.addEventListener("scroll", () => {
            this._read();
        });

        this._textareaEl.addEventListener("input", () => {
            sendWebSocketMessage({
                type: WebSocketMessageType.NEW_CHAT_MESSAGE_TYPING,
                data: {
                    chatId: this.id,
                }
            });
        });
        this._textareaEl.setAttribute("placeholder", choose(this._PHRASES));

        this._buttonEl.onclick = () => {
            if (!this._messageTextIsMeaningful(this._textareaEl.value)) {
                return;
            }
            sendMessageToWebSocketAndClearInput({
                type: WebSocketMessageType.NEW_CHAT_MESSAGE,
                data: {
                    chatId: this.id,
                    text: this._textareaEl.value,
                }
            }, this._textareaEl);
        }

        this._typingEl = this._thisEl.querySelector(".chat__interlocutor-write-hint");

        if (this._lastMessage) {
            this.addMessage(this._lastMessage, false, true);
        }
    }

    public async open(): Promise<void> {
        privateFakeChat.close();
        if (AbstractHTMLRealChat._curOpenedChat) {
            AbstractHTMLRealChat._curOpenedChat.close();
        }
        AbstractHTMLRealChat._curOpenedChat = this;

        super.open();
        if (!(this._fullyLoaded)) {
            await this._loadFull();
        }
        this._link.open();
        this._read();
    }

    public close(): void {
        super.close();
        this._link.close();
        AbstractHTMLRealChat._curOpenedChat = null;
    }

    public addMessage(apiData: ChatMessage, prepend: boolean=false, isFirst: boolean=false): void {
        apiData.creatingDatetime = new Date(apiData.creatingDatetime);
        normalizeDateTimezone(apiData.creatingDatetime);

        let dateStr = dateToDateStr(apiData.creatingDatetime);

        if (!isFirst) {
            let dateStr_;
            if (prepend && this._bottomDateStr != dateStr) {
                dateStr_ = this._bottomDateStr;
            } else if (!prepend && this._topDateStr != dateStr) {
                dateStr_ = dateStr;
            }
            if (dateStr_) {
                this._addDateSep(apiData.id, prepend, dateStr_);
            }
        }

        let scrolledToBottomBackupBeforeMessageAdding = this._scrolledToBottom()

        let fromThisUser: boolean = thisUser.id == apiData.user.id;

        let messageType: typeof HTMLChatMessage;
        if (!fromThisUser) {
            messageType = HTMLChatMessage;
        } else {
            messageType = HTMLChatMessageFromThisUser;
        }
        let message: HTMLChatMessage = new messageType(this._messagesEl, apiData.id, apiData.text, apiData.isRead, apiData.creatingDatetime, apiData.user, fromThisUser);
        message.init(prepend);
        this._messages[apiData.id] = message;

        if (scrolledToBottomBackupBeforeMessageAdding && !prepend) {
            this._scrollToBottom();
        }

        if (isFirst) {
            this._topDateStr = dateStr;
            this._bottomDateStr = dateStr;
        } else if (prepend) {
            this._bottomDateStr = dateStr;
        } else {
            this._topDateStr = dateStr;
        }

        let itIsNewInterlocutorMessage = !fromThisUser && !prepend && !isFirst;

        if (itIsNewInterlocutorMessage && (!userInWindow() || !this._isOpened)) {
            newMessageSound.play();
        }

        if (itIsNewInterlocutorMessage && userInWindow() && this._isOpened) {
            this._read();
        }

        if (!prepend) {
            this._link.updateLastMessageFromThisUserMark(fromThisUser);
            this._link.updateTextAndDate(apiData.text, dateStr);
        }

    }

    protected _scrolledToBottom(): boolean {
        return this._messagesEl.scrollHeight - this._messagesEl.scrollTop - this._messagesEl.clientHeight < 100;
    }

    protected _scrollToBottom(): void {
        this._messagesEl.scrollTop = this._messagesEl.scrollHeight;
    }

    protected _addDateSep(messageId: number, prepend: boolean, dateStr: string): void {
        let dateSep = new HTMLDateSep(this._messagesEl, dateStr);
        dateSep.init(prepend);
        this._datesSeps[messageId] = dateSep;

    }

    protected async _loadFull(): Promise<void> {
        let offsetFromEnd = Object.keys(this._messages).length;
        let apiData = await requestChatHistory({
            chatId: this.id, offsetFromEnd,
        });

        await this._fillChatHistory(apiData.messages);

        setTimeout(() => {
            this._scrollToLastReadOrMessageFromThisUser();
        }, this._WAITING_FOR_CHAT_LOADING)

        this._fullyLoaded = true;
    }

    protected async _fillChatHistory(messages: ChatMessage[]): Promise<void> {
        for (let i in messages) {
            await addUserToApiData(messages[i]);
            this.addMessage(messages[i], true);
        }
    }

    protected _scrollToLastReadOrMessageFromThisUser(): void {
        this._messagesEl.scrollTop = this._scrollTopForLastReadOrMessageFromThisUserY();
    }

    protected _scrollTopForLastReadOrMessageFromThisUserY(): number {
        let message = this._lastReadOrMessageFromThisUser();
        if (!message) {
            return 0;
        }

        let scrollTop = this._messagesEl.scrollTop;
        let messageBottomAbsY = message.getBoundingClientRect().bottom + scrollTop;
        let messagesContainerBottomAbsY = this._messagesEl.getBoundingClientRect().bottom;
        let resultY = messageBottomAbsY - messagesContainerBottomAbsY;
        return resultY;
    }

    protected _lastReadOrMessageFromThisUser(): HTMLChatMessage {
        let message = null;
        let ids = this._sortedMessagesIds();
        for (let i in ids) {
            let id = ids[i];

            let curMessage = this._messages[id];
            if ((!curMessage.fromThisUser && curMessage.isRead) || curMessage.fromThisUser) {
                message = curMessage;
            } else if (!curMessage.fromThisUser && !curMessage.isRead) {
                break;
            }
        }
        return message;
    }

    protected _sortedMessagesIds(): number[] {
        let ids: number[] = Object.keys(this._messages).map(Number);
        ids.sort((a, b) => {
            return a - b;
        });
        return ids;
    }

    public updateTyping(apiData: ChatMessageTyping): void {
        if (this._typingTimeoutId) {
            clearTimeout(this._typingTimeoutId);
        }

        this._typingEl.textContent = apiData.user.firstName + " печатает...";

        this._typingTimeoutId = setTimeout(() => {
            this._typingEl.textContent = "";
            this._typingTimeoutId = null;
        }, 1000);
    }

    protected _read(): void {
        let message = this._lastVisibleMessage();
        if (!message.isRead && !message.fromThisUser) {
            message.setAsRead();
            sendWebSocketMessage({
                type: WebSocketMessageType.CHAT_MESSAGE_WAS_READ,
                data: {
                    chatId: this.id,
                    chatMessageId: message.id,
                }
            });
        }
    }

    protected _lastVisibleMessage(): HTMLChatMessage {
        let lineAbsY = this._messagesLineBottomAbsY();

        let ids = this._sortedMessagesIds();
        let message = null;
        for (let i in ids) {
            let id = ids[i];

            let messageBottomY = this._messages[id].getBoundingClientRect().bottom;
            if (messageBottomY <= lineAbsY) {
                message = this._messages[id];
            } else {
                break;
            }
        }

        return message;
    }

    protected _messagesLineBottomAbsY(): number {
        return this._messagesEl.getBoundingClientRect().bottom;
    }

    public setMessagesAsRead(messagesIds: number[]): void {
        for (let i in messagesIds) {
            let id = messagesIds[i];
            this._messages[id].setAsRead();
        }
    }

    public updateOnlineStatus(isOnline: boolean): void {
        super.updateOnlineStatus(isOnline);
        this._link.updateOnlineStatus(isOnline);
    }

    public updateUnreadCount(count: number): void {
        this._link.updateUnreadCount(count);
    }

}
