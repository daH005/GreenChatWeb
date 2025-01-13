import { User, Message } from "../../common/apiDataInterfaces.js";
import { isMobile } from "../../common/mobileDetecting.js";
import { choose } from "../../common/random.js";
import { thisUser } from "../../common/thisUser.js";
import { userInWindow } from "../../common/userInWindowChecking.js";
import { newMessageSound } from "../../common/audio.js";
import { requestNewMessage,
         requestTyping,
         requestToReadMessage,
         requestMessages,
         requestToSaveMessageFiles,
       } from "../../common/http/functions.js";
import { addUserToApiData } from "../../common/apiDataAdding.js";
import { dateToDateStr, normalizeDateTimezone } from "../datetime.js";
import { Typing } from "../websocket/signalInterfaces.js";
import { HTMLChatLink } from "./chatLink.js";
import { HTMLDateSep } from "./dateSep.js";
import { HTMLMessage, HTMLMessageFromThisUser } from "./messages.js";
import { AbstractHTMLTemplatedElement } from "./abstractTemplatedElement.js";
import { addDragUploadingForInput } from "./files/drag.js";
import { NoOverwriteInputFilesMapper } from "./files/htmlMapping.js";

export abstract class AbstractHTMLChat extends AbstractHTMLTemplatedElement {

    protected static _chatParentEl: HTMLElement = document.getElementById("js-loaded-chats");
    protected _thisElTemplateEl: HTMLTemplateElement = <HTMLTemplateElement>document.getElementById("js-chat-temp");
    protected _fileToUploadElTemp: HTMLTemplateElement = <HTMLTemplateElement>document.getElementById("js-chat-file-to-upload-temp");

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
    protected _messages: Record<number, HTMLMessage>;
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

        this._textareaEl.addEventListener("input", async () => {
            await this._sendTyping();
        });
        this._textareaEl.setAttribute("placeholder", choose(this._PHRASES));

        this._buttonEl.onclick = async () => {
            await this._sendMessage();
        }

        this._typingEl = this._thisEl.querySelector(".chat__interlocutor-write-hint");

        this._clipInputEl = this._thisEl.querySelector(".chat__clip-input");
        addDragUploadingForInput(this._clipInputEl, this._thisEl);

        this._clipButtonEl = this._thisEl.querySelector(".chat__clip");
        this._clipButtonEl.onclick = () => {
            this._clipInputEl.click();
        }

        this._filesToUploadEl = this._thisEl.querySelector(".chat__files-to-upload");
        this._filesMapper = new NoOverwriteInputFilesMapper(this._clipInputEl, this._filesToUploadEl, this._fileToUploadElTemp);

        this._link = new HTMLChatLink(this._name, this._avatarURL);
        this._link.openChat = () => {
            this.open();
        }
        this._link.init();
        this._link.updateUnreadCount(this._unreadCount);
    }

    protected async _sendTyping(): Promise<void> {
        await requestTyping(this._id);
    }

    protected async _sendMessage(): Promise<void> {
        let textIsMeaningful: boolean = this._messageTextIsMeaningful();

        let storageId: number | null = null;
        if (this._hasFiles()) {
            storageId = await requestToSaveMessageFiles(this._clipInputEl.files);
            this._filesMapper.clear();
        } else if (!textIsMeaningful) {
            return;
        }

        let text: string = this._textareaEl.value;
        if (!textIsMeaningful) {
            text = "Файл(ы)";
        }

        await requestNewMessage({
            chatId: this._id,
            text,
            storageId,
        });

        this._textareaEl.value = "";
        this._textareaEl.style.height = "";
    }

    protected _messageTextIsMeaningful(): boolean {
        return this._textareaEl.value.replaceAll("\n", "").replaceAll(" ", "") != "";
    }

    protected _hasFiles(): boolean {
        return Boolean(this._clipInputEl.files.length);
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

    public async addMessage(apiData: Message, prepend: boolean=false): Promise<void> {
        await addUserToApiData(apiData);

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

        let messageType: typeof HTMLMessage;
        if (!fromThisUser) {
            messageType = HTMLMessage;
        } else {
            messageType = HTMLMessageFromThisUser;
        }
        let message: HTMLMessage = new messageType(this._messagesEl, apiData.id, apiData.text, apiData.isRead, apiData.creatingDatetime, apiData.user, apiData.storageId);
        await message.init(prepend);
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
            await this._read();
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
        let offset = Object.keys(this._messages).length;
        let messages = await requestMessages({
            chatId: this._id, offset,
        });

        await this._fillChatMessages(messages);

        setTimeout(() => {
            this._scrollToLastReadOrFromThisUserMessage();
        }, this._WAITING_FOR_CHAT_LOADING)

        this._fullyLoaded = true;
    }

    protected async _fillChatMessages(messages: Message[]): Promise<void> {
        for (let i in messages) {
            await this.addMessage(messages[i], true);
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

    protected _lastReadOrFromThisUserMessage(): HTMLMessage {
        let ids = this._sortedMessageIds();
        ids = ids.reverse();
        let unreadCountRest = this._unreadCount;
        for (let i in ids) {
            let id = ids[i];

            let curMessage = this._messages[id];
            if (curMessage.fromThisUser) {
                return curMessage;
            }

            unreadCountRest -= 1;
            if (unreadCountRest <= 0) {
                return curMessage;
            }
        }
    }

    protected _sortedMessageIds(): number[] {
        let ids: number[] = Object.keys(this._messages).map(Number);
        ids.sort((a, b) => {
            return a - b;
        });
        return ids;
    }

    public async updateTyping(apiData: Typing): Promise<void> {
        await addUserToApiData(apiData);

        if (this._typingTimeoutId) {
            clearTimeout(this._typingTimeoutId);
        }

        this._typingEl.textContent = apiData.user.firstName + " печатает...";

        this._typingTimeoutId = setTimeout(() => {
            this._typingEl.textContent = "";
            this._typingTimeoutId = null;
        }, 1000);
    }

    protected async _read(): Promise<void> {
        let message: HTMLMessage | null = this._lastVisibleMessage();
        if (!message) {
            return;
        }

        if (!message.isRead && !message.fromThisUser) {
            await requestToReadMessage(message.id);
        }
    }

    protected _lastVisibleMessage(): HTMLMessage {
        let lineAbsY = this._messagesLineBottomAbsY();

        let ids = this._sortedMessageIds();
        let message: HTMLMessage | null = null;
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
        this._unreadCount = count;
        this._link.updateUnreadCount(count);
    }

}
