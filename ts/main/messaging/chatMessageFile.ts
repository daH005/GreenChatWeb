import { AbstractHTMLTemplatedElement } from "./abstractChatElement.js";

export class HTMLChatMessageFile extends AbstractHTMLTemplatedElement {

    protected _thisElTemplateEl = <HTMLTemplateElement>document.getElementById("js-chat-message-file-temp");
    protected _filenameEl: HTMLElement;
    protected _downloadEl: HTMLAnchorElement;

    protected _filename: string;
    protected _url: string;

    public constructor(parentEl: HTMLElement, filename: string, url: string) {
        super(parentEl);
        this._filename = filename;
        this._url = url;
    }

    public _initChildEls(): void {
        this._filenameEl = this._thisEl.querySelector(".chat__file__name");
        this._filenameEl.textContent = this._filename;

        this._downloadEl = this._thisEl.querySelector("a");
        this._downloadEl.href = this._url;
    }

}
