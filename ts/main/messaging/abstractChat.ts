import { User, ChatMessage, ChatMessageTyping } from "../../common/apiDataInterfaces.js";
import { isMobile } from "../../common/mobileDetecting.js";
import { choose } from "../../common/random.js";
import { thisUser } from "../../common/thisUser.js";
import { userInWindow } from "../../common/userInWindowChecking.js";
import { newMessageSound } from "../../common/audio.js";
import { requestChatHistory, requestToSaveChatMessageFiles } from "../../common/http/functions.js";
import { addUserToApiData } from "../../common/apiDataAdding.js";
import { sendWebSocketMessage } from "../websocket/init.js";
import { WebSocketMessageType } from "../websocket/messageTypes.js";
import { dateToDateStr, normalizeDateTimezone } from "../datetime.js";
import { HTMLChatLink } from "./chatLink.js";
import { HTMLDateSep } from "./dateSep.js";
import { HTMLChatMessage, HTMLChatMessageFromThisUser } from "./chatMessages.js";
import { sendMessageToWebSocketAndClearInput } from "./websocketFunctions.js";
import { AbstractHTMLChatElementFacade } from "./abstractChatElement.js";
import { NoOverwriteInputFilesMapper } from "./files/htmlMapping.js";

const fileToUploadElTemp: HTMLTemplateElement = <HTMLTemplateElement>document.getElementById("js-chat-file-to-upload-temp");

export abstract class AbstractHTMLChat extends AbstractHTMLChatElementFacade {

    protected static _chatParentEl: HTMLElement = document.getElementById("js-loaded-chats");
    protected _thisElTemplateEl: HTMLTemplateElement = <HTMLTemplateElement>document.getElementById("js-chat-temp");

    protected static _chatsByIds: Record<number, AbstractHTMLChat> = {};
    protected static _curOpenedChat: AbstractHTMLChat = null;

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

    protected _backLinkEl: HTMLElement;
    protected _avatarEl: HTMLImageElement;
    protected _nameEl: HTMLElement;
    protected _textareaEl: HTMLTextAreaElement;
    protected _buttonEl: HTMLButtonElement;
    protected _messagesEl: HTMLElement;
    protected _typingEl: HTMLElement;
    protected _clipButtonEl: HTMLButtonElement;
    protected _clipInputEl: HTMLInputElement;
    protected _filesToUploadEl: HTMLElement;

    protected _filesMapper: NoOverwriteInputFilesMapper;
    protected _curMessageIsFirst: boolean = true;
    protected _isOpened: boolean = false;
    protected _avatarURL: string;
    protected _messages: Record<number, HTMLChatMessage>;
    protected _fullyLoaded: boolean = false;
    protected _datesSeps: Record<number, HTMLDateSep> = {};
    protected _link: HTMLChatLink;
    protected _topDateStr: string | null = null;
    protected _bottomDateStr: string | null = null;
    protected _typingTimeoutId: number | null = null;

    protected _id: number;
    protected _name: string;
    protected _unreadCount: number;

    public constructor(id: number, name: string, unreadCount: number) {
        super(AbstractHTMLChat._chatParentEl);
        this._id = id;
        this._name = name;
        this._unreadCount = unreadCount;

        this._messages = {};
        this._datesSeps = {};
        AbstractHTMLChat._chatsByIds[id] = this;
    }

    public static getChatById(chatId: number): AbstractHTMLChat | null {
        return AbstractHTMLChat._chatsByIds[chatId];
    }

    public async init(prepend: boolean=false): Promise<void> {
        this._avatarURL = await this._makeAvatarURL();
        super.init(prepend);
    }

    protected abstract _makeAvatarURL(): Promise<string>;

    protected _initChildEls(): void {
        super._initChildEls();

        this._backLinkEl = this._thisEl.querySelector(".chat__back-link");
        this._backLinkEl.onclick = () => {
            this.close();
        }

        this._avatarEl = this._thisEl.querySelector(".avatar");
        this._avatarEl.src = this._avatarURL;
        this._nameEl = this._thisEl.querySelector(".chat__name");

        this._textareaEl = this._thisEl.querySelector("textarea");
        this._buttonEl = this._thisEl.querySelector(".chat__send");

        this._nameEl.textContent = this._name;

        this._messagesEl = this._thisEl.querySelector(".chat__messages");
        this._messagesEl.addEventListener("scroll", () => {
            this._read();
        });

        this._textareaEl.addEventListener("input", () => {
            this._sendTyping();
        });
        this._textareaEl.setAttribute("placeholder", choose(this._PHRASES));

        this._buttonEl.onclick = async () => {
            if (!this._messageTextIsMeaningful(this._textareaEl.value)) {
                return;
            }
            await this._sendMessage();
        }

        this._typingEl = this._thisEl.querySelector(".chat__interlocutor-write-hint");

        this._clipInputEl = this._thisEl.querySelector(".chat__clip-input");

        this._clipButtonEl = this._thisEl.querySelector(".chat__clip");
        this._clipButtonEl.onclick = () => {
            this._clipInputEl.click();
        }

        this._filesToUploadEl = this._thisEl.querySelector(".chat__files-to-upload");
        this._filesMapper = new NoOverwriteInputFilesMapper(this._clipInputEl, this._filesToUploadEl, fileToUploadElTemp);

        this._link = new HTMLChatLink(this._name, this._avatarURL);
        this._link.openChat = () => {
            this.open();
        }
        this._link.init();
        this._link.updateUnreadCount(this._unreadCount);
    }

    protected _messageTextIsMeaningful(text: string): boolean {
        return text.replaceAll("\n", "").replaceAll(" ", "") != "";
    }

    protected _sendTyping(): void {
        sendWebSocketMessage({
            type: WebSocketMessageType.NEW_CHAT_MESSAGE_TYPING,
            data: {
                chatId: this._id,
            }
        });
    }

    protected async _sendMessage(): Promise<void> {

        let storageId: number | null = null;
        let hasFiles: boolean = Boolean(this._clipInputEl.files.length);
        if (hasFiles) {
            let save = await requestToSaveChatMessageFiles(this._clipInputEl.files);
            storageId = save.storageId;
            this._filesMapper.clear();
        }

        sendMessageToWebSocketAndClearInput({
            type: WebSocketMessageType.NEW_CHAT_MESSAGE,
            data: {
                chatId: this._id,
                text: this._textareaEl.value,
                storageId: storageId,
            }
        }, this._textareaEl);
    }

    public async open(): Promise<void> {
        if (AbstractHTMLChat._curOpenedChat) {
            AbstractHTMLChat._curOpenedChat.close();
        }
        AbstractHTMLChat._curOpenedChat = this;

        this._thisEl.classList.remove("chat--hidden");
        if (!isMobile) {
            this._textareaEl.focus();
        }

        this._isOpened = true;

        if (!(this._fullyLoaded)) {
            await this._loadFull();
        }
        this._link.open();
        this._read();
    }

    public close(): void {
        this._thisEl.classList.add("chat--hidden");
        this._isOpened = false;

        this._link.close();
        AbstractHTMLChat._curOpenedChat = null;
    }

    public addMessage(apiData: ChatMessage, prepend: boolean=false): void {
        apiData.creatingDatetime = new Date(apiData.creatingDatetime);
        normalizeDateTimezone(apiData.creatingDatetime);

        let dateStr = dateToDateStr(apiData.creatingDatetime);

        if (!this._curMessageIsFirst) {
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

        if (this._curMessageIsFirst) {
            this._topDateStr = dateStr;
            this._bottomDateStr = dateStr;
        } else if (prepend) {
            this._bottomDateStr = dateStr;
        } else {
            this._topDateStr = dateStr;
        }

        let itIsNewInterlocutorMessage = !fromThisUser && !prepend && !this._curMessageIsFirst;

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

        this._curMessageIsFirst = false;
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
            chatId: this._id, offsetFromEnd,
        });

        await this._fillChatHistory(apiData.messages);

        setTimeout(() => {
            this._scrollToLastReadOrFromThisUserMessage();
        }, this._WAITING_FOR_CHAT_LOADING)

        this._fullyLoaded = true;
    }

    protected async _fillChatHistory(messages: ChatMessage[]): Promise<void> {
        for (let i in messages) {
            await addUserToApiData(messages[i]);
            this.addMessage(messages[i], true);
        }
    }

    protected _scrollToLastReadOrFromThisUserMessage(): void {
        this._messagesEl.scrollTop = this._calcScrollTopForLastReadOrFromThisUserMessageY();
    }

    protected _calcScrollTopForLastReadOrFromThisUserMessageY(): number {
        let message = this._lastReadOrFromThisUserMessage();
        if (!message) {
            return 0;
        }

        let scrollTop = this._messagesEl.scrollTop;
        let messageBottomAbsY = message.getBoundingClientRect().bottom + scrollTop;
        let messagesContainerBottomAbsY = this._messagesEl.getBoundingClientRect().bottom;
        let resultY = messageBottomAbsY - messagesContainerBottomAbsY;
        return resultY;
    }

    protected _lastReadOrFromThisUserMessage(): HTMLChatMessage {
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
        let message: HTMLChatMessage | null = this._lastVisibleMessage();
        if (!message) {
            return;
        }

        if (!message.isRead && !message.fromThisUser) {
            message.setAsRead();
            sendWebSocketMessage({
                type: WebSocketMessageType.CHAT_MESSAGE_WAS_READ,
                data: {
                    chatId: this._id,
                    chatMessageId: message.id,
                }
            });
        }
    }

    protected _lastVisibleMessage(): HTMLChatMessage {
        let lineAbsY = this._messagesLineBottomAbsY();

        let ids = this._sortedMessagesIds();
        let message: HTMLChatMessage | null = null;
        for (let id of ids) {
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

    public updateUnreadCount(count: number): void {
        this._link.updateUnreadCount(count);
    }

}
