import { HTMLChatMessageFile } from "./chatMessageFile.js";

export class HTMLChatMessageImageFile extends HTMLChatMessageFile {

    protected _thisElTemplateEl = <HTMLTemplateElement>document.getElementById("js-chat-message-image-file-temp");
    protected _imageEl: HTMLImageElement;
    protected _downloadEl: HTMLAnchorElement;

    public _initChildEls(): void {
        this._filenameEl = this._thisEl.querySelector(".chat__message__image-file__name");
        this._filenameEl.textContent = this._filename;

        this._downloadEl = this._thisEl.querySelector("a");
        this._downloadEl.href = this._url;

        this._imageEl = this._thisEl.querySelector("img");
        this._imageEl.src = this._url;
    }

}
