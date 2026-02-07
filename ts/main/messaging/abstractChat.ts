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
    protected _firstOpeningWas: boolean = false;
    protected _link: HTMLChatLink;
    protected _topDateStr: string | null = null;
    protected _bottomDateStr: string | null = null;
    protected _typingTimeoutId: number | null = null;
    protected _messageIsSending: boolean = false;
    protected _lastMessageSection: HTMLChatLastMessageSection;
    protected _historySection: HTMLChatSection;
    protected _sortedMessageIds: number[];

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

        this._deleteModeSelectedMessages = [];
        this._sections = [];
        this._sortedMessageIds = [];
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
        AbstractHTMLChat._byIds[this._id] = this;
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
            if (!this._firstOpeningWas) {
                return;
            }
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

        this._lastMessageSection = new HTMLChatLastMessageSection(this, this._sections, this._messagesEl, 0);
        this._lastMessageSection.init();

        this._historySection = new HTMLChatSection(this, this._sections, this._messagesEl, this._unreadCount);
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

        let textIsNotEmpty: boolean = this._textIsNotEmpty(this._textareaEl.value);
        let hasFiles: boolean = this._hasFiles();

        if (!(textIsNotEmpty || hasFiles)) {
            return;
        }

        let text: string = this._textareaEl.value;
        if (!textIsNotEmpty) {
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
            await this._loadInitialMessages();
            this._buttonEl.disabled = false;
        }
    }

    public close(): void {
        this._el.classList.add("chat--hidden");
        this._isOpened = false;

        this._link.close();
        AbstractHTMLChat._curOpenedChat = null;
    }

    protected async _loadNextMessagesIfScrolled(): Promise<void> {
        if (this.isScrolledToTop()) {
            await this._topSection.loadNextTopMessages();
        } else if (this.isScrolledToBottom()) {
            await this._bottomSection.loadNextBottomMessages();
        }
    }

    public async addLastMessage(apiMessage: APIMessage, isNew: boolean = true): Promise<HTMLMessage> {
        let isScrolledToBottom: boolean = this.isScrolledToBottom();

        let message: HTMLMessage = await this._lastMessageSection.addMessage(apiMessage);
        this._link.updateTextWithDateAndMark(
            message.text,
            message.creatingDatetime,
            message.fromThisUser,
        );

        if (!isNew) {
            return;
        }

        if (message.fromThisUser) {
            await this._lastMessageSection.switch();
        }
        if (message.fromThisUser || isScrolledToBottom) {
            this.scrollToBottom();
        }

        if (!message.fromThisUser) {
            if (this._focused()) {
                await this._read();
            } else {
                newMessageSound.play();
            }
        }
        this._link.pushUp();
    }

    protected _focused(): boolean {
        return userInWindow() && this._isOpened;
    }

    public isScrolledToTop(): boolean {
        return this._messagesEl.scrollTop < 100;
    }

    public isScrolledToBottom(): boolean {
        return this._messagesEl.scrollHeight - this._messagesEl.scrollTop - this._messagesEl.clientHeight < 100;
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

    protected async _loadInitialMessages(): Promise<void> {
        await this._historySection.switch();
        this.scrollToBottom();
        this._firstOpeningWas = true;
    }

    public scrollToBottom(): void {
        this._messagesEl.scrollTop = this._messagesEl.scrollHeight;
    }

    public async updateTyping(apiData: Typing): Promise<void> {
        let user: APIUser = await requestUser(apiData.userId);

        if (this._typingTimeoutId != null) {
            clearTimeout(this._typingTimeoutId);
        }

        this._typingEl.textContent = user.firstName + " " + CURRENT_LABELS.typing;

        this._typingTimeoutId = setTimeout(() => {
            this._typingEl.textContent = "";
            this._typingTimeoutId = null;
        }, 1000);
    }

    protected async _read(): Promise<void> {
        if (!this._sortedMessageIds.length || !this._unreadCount) {
            return;
        }

        let firstUnreadMessageIndex: number = Math.max(0, this._sortedMessageIds.length - this._unreadCount);
        let chatBottomY: number = this._messagesEl.getBoundingClientRect().bottom;
        let lastVisibleUnreadMessageId: number | null = null;
        let currentUnreadMessage: HTMLMessage;
        for (let i = firstUnreadMessageIndex; i < this._sortedMessageIds.length; i++) {
            currentUnreadMessage = HTMLMessage.byId(this._sortedMessageIds[i]);

            if (currentUnreadMessage.getBoundingClientRect().bottom <= chatBottomY) {
                lastVisibleUnreadMessageId = this._sortedMessageIds[i];
            } else {
                break;
            }
        }

        if (lastVisibleUnreadMessageId != null) {
            await requestToReadMessage(lastVisibleUnreadMessageId);
        }
    }

    public setMessagesAsRead(messageIds: number[]): void {
        for (let messageId of messageIds) {
            let message: HTMLMessage | null = HTMLMessage.byId(messageId);
            if (message) {  // The message may be not created in HTML yet in the current scrolling position.
                message.setAsRead();
            }
        }
    }

    public addMessageId(messageId: number): void {
        let left = 0;
        let right = this._sortedMessageIds.length;

        while (left < right) {
            const mid = Math.floor((left + right) / 2);
            if (this._sortedMessageIds[mid] < messageId) {
              left = mid + 1;
            } else {
              right = mid;
            }
        }
        this._sortedMessageIds.splice(left, 0, messageId);
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
        if (!this._textIsNotEmpty(this._editModeTextareaEl.value)) {
            return;
        }

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

    protected _textIsNotEmpty(text: string): boolean {
        return text.replaceAll("\n", "").replaceAll(" ", "") != "";
    }

    protected _clearEditMode(): void {
        this._el.classList.remove("chat--edit-mode");
        if (this._editModeSelectedMessage) {
            this._editModeSelectedMessage.removeSelectToEdit();
        }
        this._editModeSelectedMessage = null;
        this._editModeFilesMapper.clear();
    }

    public updateMessageText(messageId: number, text: string): void {
        HTMLMessage.byId(messageId).updateText(text);
        if (messageId == this._sortedMessageIds[this._sortedMessageIds.length - 1]) {
            this._link.updateText(text);
        }
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

    public async deleteMessage(messageId: number): Promise<void> {
        HTMLMessage.byId(messageId).delete();
        this._sortedMessageIds.splice(this._sortedMessageIds.indexOf(messageId), 1);
        this._decreaseAllSectionOffsets();

        try {
            this._tryToGetLastMessageAndUpdateLink();
        } catch {
            await this._lastMessageSection.loadNextTopMessages();
            try {
                this._tryToGetLastMessageAndUpdateLink();
            } catch {
                this._link.clearTextWithDateAndMark();
            }
        }
    }

    protected _decreaseAllSectionOffsets(): void {
        // We have to lower all offsets of all sections to down because of the deleted message.
        for (let section of this._sections) {
            section.decreaseOffsets();
        }
    }

    protected _tryToGetLastMessageAndUpdateLink(): void {
        let lastMessageId: number | null = this._sortedMessageIds[this._sortedMessageIds.length - 1];
        if (lastMessageId != null) {
            let message: HTMLMessage = HTMLMessage.byId(lastMessageId);
            this._link.updateTextWithDateAndMark(
                message.text,
                message.creatingDatetime,
                message.fromThisUser,
            );
        } else {
            throw "No last message";
        }
    }

}
