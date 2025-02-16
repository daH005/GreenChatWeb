import { APIUser, APIMessage } from "../../common/apiDataInterfaces.js";
import { isMobile } from "../../common/mobileDetecting.js";
import { choose } from "../../common/random.js";
import { thisUser } from "../../common/thisUser.js";
import { userInWindow } from "../../common/userInWindowChecking.js";
import { newMessageSound } from "../../common/audio.js";
import { requestMessage,
         requestNewMessage,
         requestMessages,
         requestTyping,
         requestToReadMessage,
         requestToEditMessage,
         requestToDeleteMessage,
         requestToUpdateMessageFiles,
         requestToDeleteMessageFiles,
       } from "../../common/http/functions.js";
import { addUserToApiData } from "../../common/apiDataAdding.js";
import { CURRENT_LABELS } from "../../common/languages/labels.js";
import { dateToDateStr, normalizeDateTimezone } from "../datetime.js";
import { Typing } from "../websocket/signalInterfaces.js";
import { HTMLChatLink } from "./chatLink.js";
import { HTMLMessage, HTMLMessageFromThisUser } from "./messages.js";
import { AbstractHTMLTemplatedElement } from "./abstractTemplatedElement.js";
import { addDragUploadingForInput } from "./files/drag.js";
import { NoOverwriteInputFilesMapper } from "./files/htmlMapping.js";

export abstract class AbstractHTMLChat extends AbstractHTMLTemplatedElement {

    protected static _chatParentEl: HTMLElement = document.getElementById("js-loaded-chats");
    protected _templateEl: HTMLTemplateElement = <HTMLTemplateElement>document.getElementById("js-chat-temp");
    protected _fileToUploadElTemp: HTMLTemplateElement = <HTMLTemplateElement>document.getElementById("js-chat-file-to-upload-temp");

    protected static _chatsByIds: Record<number, AbstractHTMLChat> = {};
    protected static _curOpenedChat: AbstractHTMLChat = null;

    protected readonly _WAITING_FOR_CHAT_LOADING: number = 300;  // FixMe: it's so bad... I have not found a decision yet.
    protected readonly _PHRASES: string[] = CURRENT_LABELS.phrases;

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

    protected _editModeTextareaEl: HTMLTextAreaElement;
    protected _editModeButtonEl: HTMLButtonElement;
    protected _editModeClipButtonEl: HTMLButtonElement;
    protected _editModeClipInputEl: HTMLInputElement;
    protected _editModeFilesToUploadEl: HTMLElement;
    protected _editModeBackButton: HTMLButtonElement;
    protected _editModeFilesMapper: NoOverwriteInputFilesMapper;
    protected _editModeSelectedMessage: HTMLMessageFromThisUser | null = null;

    protected _deleteModeBackEl: HTMLElement;
    protected _deleteModeSelectedCountLabelEl: HTMLElement;
    protected _deleteModeSelectedCountEl: HTMLElement;
    protected _deleteModeConfirmButtonEl: HTMLButtonElement;
    protected _deleteModeSelectedMessages: HTMLMessage[];

    protected _filesMapper: NoOverwriteInputFilesMapper;
    protected _isOpened: boolean = false;
    protected _avatarURL: string;
    protected _messages: Record<number, HTMLMessage>;
    protected _fullyLoaded: boolean = false;
    protected _link: HTMLChatLink;
    protected _topDateStr: string | null = null;
    protected _bottomDateStr: string | null = null;
    protected _typingTimeoutId: number | null = null;
    protected _lastMessage: HTMLMessage | null = null;

    protected _id: number;
    protected _name: string;
    protected _unreadCount: number;

    public constructor(id: number, name: string, unreadCount: number) {
        super(AbstractHTMLChat._chatParentEl);
        this._id = id;
        this._name = name;
        this._unreadCount = unreadCount;

        this._messages = {};
        this._deleteModeSelectedMessages = [];
        AbstractHTMLChat._chatsByIds[id] = this;
    }

    public static byId(chatId: number): AbstractHTMLChat | null {
        return AbstractHTMLChat._chatsByIds[chatId];
    }

    public async init(prepend: boolean=false): Promise<void> {
        this._avatarURL = await this._makeAvatarURL();
        super.init(prepend);
    }

    protected abstract _makeAvatarURL(): Promise<string>;

    protected _initChildEls(): void {
        super._initChildEls();

        this._backLinkEl = this._el.querySelector(".chat__back-link");
        this._backLinkEl.onclick = () => {
            this.close();
        }

        this._avatarEl = this._el.querySelector(".avatar");
        this._avatarEl.src = this._avatarURL;

        this._nameEl = this._el.querySelector(".chat__name");
        this._nameEl.textContent = this._name;

        this._messagesEl = this._el.querySelector(".chat__messages");
        this._messagesEl.addEventListener("scroll", async () => {
            await this._read();
        });
        this._typingEl = this._el.querySelector(".chat__interlocutor-write-hint");

        this._textareaEl = this._el.querySelector(".chat__main-panel textarea");
        this._textareaEl.addEventListener("input", async () => {
            await this._sendTyping();
        });
        this._textareaEl.setAttribute("placeholder", choose(this._PHRASES));

        this._buttonEl = this._el.querySelector(".chat__main-panel .chat__send");
        this._buttonEl.onclick = async () => {
            await this._sendMessage();
        }

        this._clipInputEl = this._el.querySelector(".chat__main-panel .chat__clip-input");
        addDragUploadingForInput(this._clipInputEl, this._el);

        this._clipButtonEl = this._el.querySelector(".chat__main-panel .chat__clip");
        this._clipButtonEl.onclick = () => {
            this._clipInputEl.click();
        }

        this._filesToUploadEl = this._el.querySelector(".chat__main-panel .chat__files-to-upload");
        this._filesMapper = new NoOverwriteInputFilesMapper(this._clipInputEl, this._filesToUploadEl, this._fileToUploadElTemp);

        this._link = new HTMLChatLink(this, this._name, this._avatarURL);
        this._link.init();
        this._link.updateUnreadCount(this._unreadCount);
        
        this._initEditModeEls();
        this._initDeleteModeEls();
    }
    
    protected _initEditModeEls(): void {
        this._editModeTextareaEl = this._el.querySelector(".chat__edit-panel textarea");
        this._editModeButtonEl = this._el.querySelector(".chat__edit-panel .chat__send");
        this._editModeButtonEl.onclick = async () => {
            await this._editSelectedMessage();
        }

        this._editModeClipInputEl = this._el.querySelector(".chat__edit-panel .chat__clip-input");
        addDragUploadingForInput(this._editModeClipInputEl, this._el);

        this._editModeClipButtonEl = this._el.querySelector(".chat__edit-panel .chat__clip");
        this._editModeClipButtonEl.onclick = () => {
            this._editModeClipInputEl.click();
        }

        this._editModeFilesToUploadEl = this._el.querySelector(".chat__edit-panel .chat__files-to-upload");
        this._editModeFilesMapper = new NoOverwriteInputFilesMapper(
            this._editModeClipInputEl,
            this._editModeFilesToUploadEl,
            this._fileToUploadElTemp,
        );

        this._editModeBackButton = this._el.querySelector(".chat__edit-panel__back");
        this._editModeBackButton.onclick = () => {
            this._clearEditMode();
        }
    }
    
    protected _initDeleteModeEls(): void {
        this._deleteModeBackEl = this._el.querySelector(".chat__delete-panel__back");
        this._deleteModeBackEl.onclick = () => {
            this._clearDeleteMode();
        }

        this._deleteModeSelectedCountLabelEl = this._el.querySelector(".chat__delete-panel__selected-count__label");
        this._deleteModeSelectedCountLabelEl.textContent = CURRENT_LABELS.selectedCount;
        this._deleteModeSelectedCountEl = this._el.querySelector(".chat__delete-panel__selected-count");

        this._deleteModeConfirmButtonEl = this._el.querySelector(".chat__delete-panel__confirm");
        this._deleteModeConfirmButtonEl.textContent = CURRENT_LABELS.delete;
        this._deleteModeConfirmButtonEl.onclick = async () => {
            await this._confirmDelete();
        }
    }
    
    protected async _sendTyping(): Promise<void> {
        await requestTyping(this._id);
    }

    protected async _sendMessage(): Promise<void> {
        let textIsMeaningful: boolean = this._messageTextIsMeaningful();
        let hasFiles: boolean = this._hasFiles();

        if (!(textIsMeaningful || hasFiles)) {
            return;
        }

        let text: string = this._textareaEl.value;
        if (!textIsMeaningful) {
            text = CURRENT_LABELS.files;
        }

        let message = await requestNewMessage({
            chatId: this._id,
            text,
        });

        this._textareaEl.value = "";
        this._textareaEl.style.height = "";

        if (hasFiles) {
            await requestToUpdateMessageFiles(message.id, this._clipInputEl.files);
            this._filesMapper.clear();
        }
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

        this._el.classList.remove("chat--hidden");
        if (!isMobile) {
            this._textareaEl.focus();
        }

        this._isOpened = true;

        if (!(this._fullyLoaded)) {
            await this._loadFull();
        }
        this._link.open();
        await this._read();
    }

    public close(): void {
        this._el.classList.add("chat--hidden");
        this._isOpened = false;

        this._link.close();
        AbstractHTMLChat._curOpenedChat = null;
    }

    public async addMessage(apiData: APIMessage, prepend: boolean=false): Promise<void> {
        await addUserToApiData(apiData);

        apiData.creatingDatetime = new Date(apiData.creatingDatetime);
        normalizeDateTimezone(apiData.creatingDatetime);

        let scrolledToBottomBackupBeforeMessageAdding = this._scrolledToBottom()
        let fromThisUser: boolean = thisUser.id == apiData.user.id;

        let messageType: typeof HTMLMessage;
        if (!fromThisUser) {
            messageType = HTMLMessage;
        } else {
            messageType = HTMLMessageFromThisUser;
        }
        let message: HTMLMessage = new messageType(
            this, this._messagesEl,
            apiData.id, apiData.text, apiData.isRead, apiData.creatingDatetime, apiData.user, apiData.hasFiles,
        );
        message.init(prepend);

        if ((scrolledToBottomBackupBeforeMessageAdding && !prepend) || fromThisUser) {
            this.scrollToBottom();
        }

        let itIsNewInterlocutorMessage = !fromThisUser && !prepend;
        if (itIsNewInterlocutorMessage && (!userInWindow() || !this._isOpened)) {
            newMessageSound.play();
        }

        if (itIsNewInterlocutorMessage && userInWindow() && this._isOpened) {
            await this._read();
        }

        let isFirst: boolean = !Object.keys(this._messages).length;  // FixMe: `Object.keys(...).length` is slow
        if (!prepend || isFirst) {
            this._link.updateTextAndDate(apiData.text, dateToDateStr(apiData.creatingDatetime), fromThisUser);
            this._lastMessage = message;
        }

        if (!prepend) {
            this._link.pushUp();
        }

        this._messages[apiData.id] = message;
    }

    protected _scrolledToBottom(): boolean {
        return this._messagesEl.scrollHeight - this._messagesEl.scrollTop - this._messagesEl.clientHeight < 100;
    }

    public scrollToBottom(): void {
        this._messagesEl.scrollTop = this._messagesEl.scrollHeight;
    }

    protected async _loadFull(): Promise<void> {
        let offset: number = Object.keys(this._messages).length;
        let messages: APIMessage[] = await requestMessages(
            this._id, {offset},
        );

        await this._fillMessages(messages);

        setTimeout(() => {
            this._scrollToLastReadOrFromThisUserMessage();
        }, this._WAITING_FOR_CHAT_LOADING)

        this._fullyLoaded = true;
    }

    protected async _fillMessages(messages: APIMessage[]): Promise<void> {
        for (let message of messages) {
            await this.addMessage(message, true);
        }
    }

    protected _scrollToLastReadOrFromThisUserMessage(): void {
        this._messagesEl.scrollTop = this._calcScrollTopForLastReadOrFromThisUserMessageY();
    }

    protected _calcScrollTopForLastReadOrFromThisUserMessageY(): number {
        let message: HTMLMessage = this._lastReadOrFromThisUserMessage();
        if (!message) {
            return 0;
        }

        let scrollTop: number = this._messagesEl.scrollTop;
        let messageBottomAbsY: number = message.getBoundingClientRect().bottom + scrollTop;
        let messagesContainerBottomAbsY: number = this._messagesEl.getBoundingClientRect().bottom;
        let resultY = messageBottomAbsY - messagesContainerBottomAbsY;
        return resultY;
    }

    public async updateTyping(apiData: Typing): Promise<void> {
        await addUserToApiData(apiData);

        if (this._typingTimeoutId) {
            clearTimeout(this._typingTimeoutId);
        }

        this._typingEl.textContent = apiData.user.firstName + " " + CURRENT_LABELS.typing;

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

        if (message.id > this._lastReadOrFromThisUserMessage().id) {
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

    protected _lastReadOrFromThisUserMessage(): HTMLMessage {
        let ids = this._sortedMessageIds().reverse();
        let unreadCountRest = this._unreadCount + 1;
        for (let id of ids) {
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

    public setMessagesAsRead(messageIds: number[]): void {
        for (let id of messageIds) {
            this._messages[id].setAsRead();
        }
    }

    public updateUnreadCount(count: number): void {
        this._unreadCount = count;
        this._link.updateUnreadCount(count);
    }

    public toEditMode(message: HTMLMessageFromThisUser): void {
        this._el.classList.add("chat--edit-mode");
        this._editModeSelectedMessage = message;
        this._editModeSelectedMessage.selectToEdit();

        this._editModeTextareaEl.value = this._editModeSelectedMessage.text;
        this._editModeTextareaEl.style.height = "0px";
        this._editModeTextareaEl.style.height = this._editModeTextareaEl.scrollHeight + "px";
        for (let filename of this._editModeSelectedMessage.filenames) {
            this._editModeFilesMapper.addServerFile(filename, this._editModeSelectedMessage.urlOfFile(filename));
        }
    }

    protected async _editSelectedMessage(): Promise<void> {
        if (this._editModeTextareaEl.value != this._editModeSelectedMessage.text) {
            await requestToEditMessage({
                messageId: this._editModeSelectedMessage.id,
                text: this._editModeTextareaEl.value,
            });
        }

        let filenamesToDelete: string[] = this._editModeFilesMapper.getServerFilenamesToDelete();
        if (filenamesToDelete.length) {
            await requestToDeleteMessageFiles({
                messageId: this._editModeSelectedMessage.id,
                filenames: filenamesToDelete,
            });
        }

        if (this._editModeClipInputEl.files.length) {
            await requestToUpdateMessageFiles(this._editModeSelectedMessage.id, this._editModeClipInputEl.files);
        }

        this._clearEditMode();
    }

    protected _clearEditMode(): void {
        this._el.classList.remove("chat--edit-mode");
        if (this._editModeSelectedMessage) {
            this._editModeSelectedMessage.removeSelectToEdit();
        }
        this._editModeSelectedMessage = null;
        this._editModeFilesMapper.clear();
    }

    public toDeleteMode(): void {
        this._el.classList.add("chat--delete-mode");
        this._deleteModeSelectedCountEl.textContent = "0";
    }

    public selectMessageToDelete(message: HTMLMessage): void {
        message.selectToDelete();

        this._deleteModeSelectedMessages.push(message);
        this._updateSelectedToDeleteCount();
    }

    public removeSelectMessageToDelete(message: HTMLMessage): void {
        message.removeSelectToDelete();

        let index: number = this._deleteModeSelectedMessages.indexOf(message);
        this._deleteModeSelectedMessages.splice(index, 1);
        this._updateSelectedToDeleteCount();
    }

    protected _updateSelectedToDeleteCount(): void {
        this._deleteModeSelectedCountEl.textContent = String(this._deleteModeSelectedMessages.length);
    }

    protected async _confirmDelete(): Promise<void> {
        for (let message of this._deleteModeSelectedMessages) {
            await requestToDeleteMessage(message.id);
        }
        this._clearDeleteMode();
    }

    protected _clearDeleteMode(): void {
        this._el.classList.remove("chat--delete-mode");
        for (let message of this._deleteModeSelectedMessages) {
            message.removeSelectToDelete();
        }
        this._deleteModeSelectedMessages = [];
    }

    public deleteMessage(messageId: number): void {
        this._messages[messageId].delete();
        delete this._messages[messageId];
    }

    public get lastMessage(): HTMLMessage | null {
        return this._lastMessage;
    }

}
