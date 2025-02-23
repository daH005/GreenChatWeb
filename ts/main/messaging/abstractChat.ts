import { APIUser, APIMessage } from "../../common/apiDataInterfaces.js";
import { isMobile } from "../../common/mobileDetecting.js";
import { choose } from "../../common/random.js";
import { thisUser } from "../../common/thisUser.js";
import { userInWindow } from "../../common/userInWindowChecking.js";
import { newMessageSound } from "../../common/audio.js";
import { requestUser,
         requestMessage,
         requestNewMessage,
         requestMessages,
         requestTyping,
         requestToReadMessage,
         requestToEditMessage,
         requestToDeleteMessage,
         requestToUpdateMessageFiles,
         requestToDeleteMessageFiles,
       } from "../../common/http/functions.js";
import { CURRENT_LABELS } from "../../common/languages/labels.js";
import { Typing } from "../websocket/signalInterfaces.js";
import { HTMLChatLink } from "./chatLink.js";
import { HTMLMessage, HTMLMessageFromThisUser } from "./messages.js";
import { HTMLChatSection, HTMLChatLastMessageSection } from "./chatSection.js";
import { AbstractHTMLTemplatedElement } from "./abstractTemplatedElement.js";
import { addDragUploadingForInput } from "./files/drag.js";
import { NoOverwriteInputFilesMapper } from "./files/htmlMapping.js";

export abstract class AbstractHTMLChat extends AbstractHTMLTemplatedElement {

    protected static __parentEl: HTMLElement = document.getElementById("js-loaded-chats");
    protected _templateEl: HTMLTemplateElement = <HTMLTemplateElement>document.getElementById("js-chat-temp");
    protected _fileToUploadElTemp: HTMLTemplateElement = <HTMLTemplateElement>document.getElementById("js-chat-file-to-upload-temp");

    protected static _byIds: Record<number, AbstractHTMLChat> = {};
    protected static _curOpenedChat: AbstractHTMLChat = null;

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
    protected _firstOpeningWas: boolean = false;
    protected _link: HTMLChatLink;
    protected _topDateStr: string | null = null;
    protected _bottomDateStr: string | null = null;
    protected _typingTimeoutId: number | null = null;
    protected _messageIsSending: boolean = false;
    protected _lastReadMessageId: number = -Infinity;
    protected _lastMessageSection: HTMLChatLastMessageSection;
    protected _historySection: HTMLChatSection;

    protected _topSection: HTMLChatSection;
    protected _bottomSection: HTMLChatSection;
    protected _sections: HTMLChatSection[];

    protected _id: number;
    protected _name: string;
    protected _unreadCount: number;

    public constructor(id: number, name: string, unreadCount: number) {
        super(AbstractHTMLChat.__parentEl);
        this._id = id;
        this._name = name;
        this._unreadCount = unreadCount;

        this._messages = {};
        this._deleteModeSelectedMessages = [];
        this._sections = [];
        AbstractHTMLChat._byIds[this._id] = this;
    }

    public static byId(id: number): AbstractHTMLChat | null {
        return AbstractHTMLChat._byIds[id];
    }

    public get id(): number {
        return this._id;
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
            await this._loadNextMessagesIfScrolled();
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

        this._lastMessageSection = new HTMLChatLastMessageSection(this, this._sections, this._messagesEl, 0, this._messages);
        this._lastMessageSection.init();

        this._historySection = new HTMLChatSection(this, this._sections, this._messagesEl, this._unreadCount, this._messages);
        this._historySection.init();

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
        if (this._messageIsSending) {
            return;
        }
        this._messageIsSending = true;

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
            try {
                await requestToUpdateMessageFiles(message.id, this._clipInputEl.files);
            } catch {}
            this._filesMapper.clear();
        }

        this._messageIsSending = false;
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

        this._link.open();
        this._el.classList.remove("chat--hidden");
        if (!isMobile) {
            this._textareaEl.focus();
        }
        this._isOpened = true;

        if (!(this._firstOpeningWas)) {
            this._buttonEl.disabled = true;
            await this._loadInitial();
            this._buttonEl.disabled = false;
        }
        await this._read();
    }

    public close(): void {
        this._el.classList.add("chat--hidden");
        this._isOpened = false;

        this._link.close();
        AbstractHTMLChat._curOpenedChat = null;
    }

    protected async _loadNextMessagesIfScrolled(): Promise<void> {
        if (this._scrolledToTop()) {
            await this._topSection.loadNextTopMessages();
        } else if (this._scrolledToBottom()) {
            await this._bottomSection.loadNextBottomMessages();
        }
    }

    public async addLastMessage(apiMessage: APIMessage, isNew: boolean = true): Promise<HTMLMessage> {
        let scrolledToBottom: boolean = this._scrolledToBottom();

        let message: HTMLMessage = await this._lastMessageSection.addMessage(apiMessage);
        if ((scrolledToBottom || message.fromThisUser) && isNew) {
            await this._lastMessageSection.switch();
            this._scrollToBottom();
        }

        this._link.updateTextAndDate(
            message.text,
            message.creatingDatetime,
            message.fromThisUser,
        );

        if (!isNew) {
            return;
        }

        if (this._focused()) {
            await this._read();
        } else {
            newMessageSound.play();
        }
        this._link.pushUp();
    }

    protected _focused(): boolean {
        return userInWindow() && this._isOpened;
    }

    protected _scrolledToTop(): boolean {
        return this._messagesEl.scrollTop < 100;
    }

    protected _scrolledToBottom(): boolean {
        return this._messagesEl.scrollHeight - this._messagesEl.scrollTop - this._messagesEl.clientHeight < 100;
    }

    protected _scrollToBottom(): void {
        this._messagesEl.scrollTop = this._messagesEl.scrollHeight;
    }

    public setTopSection(section: HTMLChatSection): void {
        this._topSection = section;
    }

    public setBottomSection(section: HTMLChatSection): void {
        this._bottomSection = section;
    }

    public hideSections(): void {
        for (let section of this._sections) {
            section.hide();
        }
    }

    protected async _loadInitial(): Promise<void> {
        await this._historySection.switch();
        this._firstOpeningWas = true;
        this._scrollToInitial();
    }

    protected _scrollToInitial(): void {
        this._messagesEl.scrollTop = this._messagesEl.scrollHeight - 150;
    }

    public async updateTyping(apiData: Typing): Promise<void> {
        let user: APIUser = await requestUser(apiData.userId);

        if (this._typingTimeoutId) {
            clearTimeout(this._typingTimeoutId);
        }

        this._typingEl.textContent = user.firstName + " " + CURRENT_LABELS.typing;

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

        if (message.id > this._lastReadMessageId) {
            await requestToReadMessage(message.id);
            this._lastReadMessageId = message.id;
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

}
