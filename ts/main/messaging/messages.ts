import { APIUser } from "../../common/apiDataInterfaces.js";
import { HTTP_API_URLS } from "../../common/http/apiUrls.js";
import { makeUrlWithParams } from "../../common/http/base.js";
import { requestToReadMessage, requestMessageFilenames } from "../../common/http/functions.js";
import { dateToTimeStr }  from "../datetime.js";
import { makeHyperlinks, makeHighlights } from "../messageTextHighlighting.js";
import { AbstractHTMLTemplatedElement } from "./abstractTemplatedElement.js";
import { HTMLDateSep } from "./dateSep.js";
import { AbstractHTMLChat } from "./abstractChat.js";
import { HTMLMessageFile } from "./messageFile.js";
import { HTMLMessageImageFile } from "./messageImageFile.js";
import { HTMLChatSection } from "./chatSection.js";

export class HTMLMessage extends AbstractHTMLTemplatedElement {

    protected static _byIds: Record<number, HTMLMessage> = {};
    protected static _IMAGE_FILE_EXTENSIONS = [
        ".png", ".jpg", ".jpeg", ".webp",
    ];

    protected _templateEl = <HTMLTemplateElement>document.getElementById("js-message-temp");
    protected _userNameEl: HTMLElement;
    protected _textEl: HTMLElement;
    protected _timeEl: HTMLElement;
    protected _filesEl: HTMLElement;
    protected _imageFilesEl: HTMLElement;
    protected _deleteModeButton: HTMLElement;
    protected _selectToDeleteButton: HTMLElement;

    protected _chat: AbstractHTMLChat;
    protected _section: HTMLChatSection;
    protected _id: number;
    protected _text: string;
    protected _isRead: boolean;
    protected _creatingDatetime: Date;
    protected _user: APIUser;
    protected _hasFiles: boolean;
    protected _fromThisUser: boolean = false;
    protected _filenames: string[];
    protected _urlsByFilenames: Record<string, string>;
    protected _isSelectedToDelete: boolean = false;
    protected _dateSep: HTMLDateSep;
    protected _imageFileVersion: number = 0;  // I add this in end of url of image file to browser to update image.
    // This flag helps when at the same the client reveive "FILES" and "NEW_MESSAGE" (and the message already have True "hasFiles" field) signals.
    protected _filesIsUpdatingNow: boolean = false;

    public constructor(chat: AbstractHTMLChat,
                       section: HTMLChatSection,
                       parentEl: HTMLElement,
                       id: number,
                       text: string,
                       isRead: boolean,
                       creatingDatetime: Date,
                       user: APIUser,
                      ) {
        super(parentEl);
        this._chat = chat;
        this._section = section;
        this._id = id;
        this._text = text;
        this._isRead = isRead;
        this._creatingDatetime = creatingDatetime;
        this._user = user;
        this._filenames = [];
        this._urlsByFilenames = {};
    }

    public static byId(id: number): HTMLMessage | null {
        return HTMLMessage._byIds[id];
    }

    public init(prepend: boolean=false): void {
        super.init(prepend);
        this._updateDateSep();
        HTMLMessage._byIds[this._id] = this;
    }

    protected _updateDateSep(): void {
        let dateSepId: string = this._makeDateSepId();
        let dateSep: HTMLDateSep | null = HTMLDateSep.byId(dateSepId);
        if (!dateSep) {
            dateSep = new HTMLDateSep(this._parentEl, dateSepId, this._creatingDatetime);
            dateSep.init();
        }
        this._dateSep = dateSep;
        this._dateSep.update(this._parentEl, this._el, this._creatingDatetime);
    }

    protected _makeDateSepId(): string {
        return String(this._chat.id) + "_" + this._creatingDatetime.toISOString().split("T")[0];
    }

    protected _initChildEls(): void {
        this._userNameEl = this._el.querySelector(".chat__message__name");
        this._userNameEl.textContent = this._user.firstName;

        this._textEl = this._el.querySelector(".chat__message__text");
        this.updateText(this._text);

        this._timeEl = this._el.querySelector(".chat__message__time");
        this._timeEl.textContent = this._timeStr();

        this._filesEl = this._el.querySelector(".chat__message__files");
        this._imageFilesEl = this._el.querySelector(".chat__message__image-files");

        this._deleteModeButton = this._el.querySelector(".chat__message__function--delete");
        this._deleteModeButton.onclick = () => {
            this._chat.toDeleteMode();
            this._chat.selectMessageToDelete(this);
        }

        this._selectToDeleteButton = this._el.querySelector(".chat__message__delete");
        this._selectToDeleteButton.onclick = () => {
            if (!this._isSelectedToDelete) {
                this._chat.selectMessageToDelete(this);
            } else {
                this._chat.removeSelectMessageToDelete(this);
            }
        }
    }

    public updateText(text: string): void {
        this._text = text;
        this._textEl.textContent = this._text;
        this._textEl.innerHTML = this._formattedMessageTextHtml(this._textEl.innerHTML);
    }

    public async resetFiles(): Promise<void> {
        if (this._filesIsUpdatingNow) {
            return;
        }
        this._filesIsUpdatingNow = true;
        let chatIsScrolledToBottom: boolean = this._chat.isScrolledToBottom();

        this._filenames = await requestMessageFilenames(this._id) ?? [];
        this._imageFilesEl.innerHTML = "";
        this._filesEl.innerHTML = "";
        for (let filename of this._filenames) {
            await this._addFile(filename);
        }
        this._imageFileVersion += 1;

        if (chatIsScrolledToBottom) {
            this._chat.scrollToBottom();
        }
        this._filesIsUpdatingNow = false;
    }

    protected async _addFile(filename: string): Promise<void> {
        let extension: string = filename.slice(filename.lastIndexOf('.')).toLowerCase();
        let url: string = this._makeFileUrl(filename);
        this._urlsByFilenames[filename] = url;

        let isImage: boolean = HTMLMessage._IMAGE_FILE_EXTENSIONS.includes(extension);
        let file: HTMLMessageFile | HTMLMessageImageFile;
        if (isImage) {
            file = new HTMLMessageImageFile(this._imageFilesEl, filename, url);
        } else {
            file = new HTMLMessageFile(this._filesEl, filename, url);
        }
        file.init();
        if (isImage) {
            await (file as HTMLMessageImageFile).waitForImageLoading();
        }
    }

    protected _formattedMessageTextHtml(html: string): string {
        html = makeHyperlinks(html);
        html = makeHighlights(html);
        return html;
    }

    protected _timeStr(): string {
        return dateToTimeStr(this._creatingDatetime);
    }

    protected _makeFileUrl(filename: string): string {
        return makeUrlWithParams(HTTP_API_URLS.MESSAGE_FILES_GET, {messageId: this._id, filename}) + "#" + String(this._imageFileVersion);
    }

    public get id(): number {
        return this._id;
    }

    public get chat(): AbstractHTMLChat {
        return this._chat;
    }

    public get section(): HTMLChatSection {
        return this._section;
    }

    public get fromThisUser(): boolean {
        return this._fromThisUser;
    }

    public get creatingDatetime(): Date {
        return this._creatingDatetime;
    }

    public get isRead(): boolean {
        return this._isRead;
    }

    public get text(): string {
        return this._text;
    }

    public get filenames(): string[] {
        return this._filenames;
    }

    public urlOfFile(filename: string): string {
        return this._urlsByFilenames[filename];
    }

    public setAsRead(): void {
        this._el.classList.remove("chat__message--unread");
        this._isRead = true;
    }

    public getBoundingClientRect(): DOMRect {
        return this._el.getBoundingClientRect();
    }

    public selectToDelete(): void {
        this._selectToDeleteButton.classList.add("chat__message__delete--selected");
        this._isSelectedToDelete = true;
    }

    public removeSelectToDelete(): void {
        this._selectToDeleteButton.classList.remove("chat__message__delete--selected");
        this._isSelectedToDelete = false;
    }

    public delete(): void {
        this._el.remove();
        delete HTMLMessage._byIds[this._id];
        this._dateSep.deleteIfAllMessagesAreDeleted();
    }

}

export class HTMLMessageFromThisUser extends HTMLMessage {
    protected _editModeButton: HTMLElement;
    protected _fromThisUser: boolean = true;

    protected _initThisEl(prepend: boolean) {
        super._initThisEl(prepend);

        this._el.classList.add("chat__message--self");
        if (!this._isRead) {
            this._el.classList.add("chat__message--unread");
        }
    }

    protected _initChildEls(): void {
        super._initChildEls();
        this._editModeButton = this._el.querySelector(".chat__message__function--edit");
        this._editModeButton.onclick = () => {
            this._chat.toEditMode(this);
        }
    }

    public selectToEdit(): void {
        this._el.classList.add("chat__message--edit-mode-selected");
    }

    public removeSelectToEdit(): void {
        this._el.classList.remove("chat__message--edit-mode-selected");
    }

}
