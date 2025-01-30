import { User } from "../../common/apiDataInterfaces.js";
import { HTTP_API_URLS } from "../../common/http/apiUrls.js";
import { makeUrlWithParams } from "../../common/http/base.js";
import { requestToReadMessage, requestMessageFilenames } from "../../common/http/functions.js";
import { dateToTimeStr }  from "../datetime.js";
import { makeHyperlinks, makeHighlights } from "../messageTextHighlighting.js";
import { AbstractHTMLTemplatedElement } from "./abstractTemplatedElement.js";
import { AbstractHTMLChat } from "./abstractChat.js";
import { HTMLMessageFile } from "./messageFile.js";
import { HTMLMessageImageFile } from "./messageImageFile.js";

export class HTMLMessage extends AbstractHTMLTemplatedElement {

    protected static _messagesByIds: Record<number, HTMLMessage> = {};
    protected static _IMAGE_FILE_EXTENSIONS = [
        ".png", ".jpg", ".jpeg", ".webp",
    ];

    protected _thisElTemplateEl = <HTMLTemplateElement>document.getElementById("js-message-temp");
    protected _userNameEl: HTMLElement;
    protected _textEl: HTMLElement;
    protected _timeEl: HTMLElement;
    protected _filesEl: HTMLElement;
    protected _imageFilesEl: HTMLElement;

    protected _chat: AbstractHTMLChat;
    protected _id: number;
    protected _text: string;
    protected _isRead: boolean;
    protected _creatingDatetime: Date;
    protected _user: User;
    protected _hasFiles: boolean;
    protected _filenames: string[];

    public constructor(chat: AbstractHTMLChat,
                       parentEl: HTMLElement,
                       id: number,
                       text: string,
                       isRead: boolean,
                       creatingDatetime: Date,
                       user: User,
                       hasFiles: boolean,
                      ) {
        super(parentEl);
        this._chat = chat;
        this._id = id;
        this._text = text;
        this._isRead = isRead;
        this._creatingDatetime = creatingDatetime;
        this._user = user;
        this._hasFiles = hasFiles;
        HTMLMessage._messagesByIds[id] = this;
    }

    public static byId(messageId: number): HTMLMessage | null {
        return HTMLMessage._messagesByIds[messageId];
    }

    public async init(prepend: boolean=false): Promise<void> {
        if (this._hasFiles) {
            this._filenames = await requestMessageFilenames(this._id) ?? [];
        } else {
            this._filenames = [];
        }
        super.init(prepend);
    }

    public async updateFiles(): Promise<void> {
        let newFilenames = await requestMessageFilenames(this._id) ?? [];
        if (!newFilenames.length) {
            return;
        }

        for (let filename of newFilenames) {
            if (this._filenames.includes(filename)) {
                continue;
            }
            this._addFile(filename);
        }
    }

    protected _initChildEls(): void {
        this._userNameEl = this._thisEl.querySelector(".chat__message__name");
        this._userNameEl.textContent = this._user.firstName;

        this._textEl = this._thisEl.querySelector(".chat__message__text");
        this._textEl.textContent = this._text;
        this._textEl.innerHTML = this._formattedMessageTextHtml(this._textEl.innerHTML);

        this._timeEl = this._thisEl.querySelector(".chat__message__time");
        this._timeEl.textContent = this._timeStr();

        this._filesEl = this._thisEl.querySelector(".chat__message__files");
        this._imageFilesEl = this._thisEl.querySelector(".chat__message__image-files");

        this._filenames.forEach(this._addFile.bind(this));
    }

    protected _addFile(filename: string): void {
        let extension: string = filename.slice(filename.lastIndexOf('.')).toLowerCase();
        let url: string = this._makeFileUrl(filename);

        let file: HTMLMessageFile | HTMLMessageImageFile;
        if (HTMLMessage._IMAGE_FILE_EXTENSIONS.includes(extension)) {
            file = new HTMLMessageImageFile(this._imageFilesEl, filename, url);
        } else {
            file = new HTMLMessageFile(this._filesEl, filename, url);
        }
        file.init();
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
        return makeUrlWithParams(HTTP_API_URLS.MESSAGE_FILES_GET, {messageId: this._id, filename});
    }

    public get id(): number {
        return this._id;
    }

    public get fromThisUser(): boolean {
        return false;
    }

    public get isRead(): boolean {
        return this._isRead;
    }

    public setAsRead(): void {
        this._thisEl.classList.remove("chat__message--unread");
        this._isRead = true;
    }

    public getBoundingClientRect(): DOMRect {
        return this._thisEl.getBoundingClientRect();
    }

}

export class HTMLMessageFromThisUser extends HTMLMessage {
    
    protected _initThisEl(prepend: boolean) {
        super._initThisEl(prepend);

        this._thisEl.classList.add("chat__message--self");
        if (!this._isRead) {
            this._thisEl.classList.add("chat__message--unread");
        }
    }

    public get fromThisUser(): boolean {
        return true;
    }

}
