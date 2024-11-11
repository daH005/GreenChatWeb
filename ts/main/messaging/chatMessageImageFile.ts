import { HTMLChatMessageFile } from "./chatMessageFile.js";

export class HTMLChatMessageImageFile extends HTMLChatMessageFile {

    protected _imageEl: HTMLImageElement;

    public _initChildEls(): void {
        super._initChildEls();
        this._filenameEl = this._thisEl.querySelector(".chat__message__image-file__name");
        this._filenameEl.textContent = this._filename;

        this._imageEl = this._thisEl.querySelector("img");
        this._imageEl.src = this._url;
    }

}
