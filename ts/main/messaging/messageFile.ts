import { AbstractHTMLTemplatedElement } from "./abstractChatElement.js";

export class HTMLMessageFile extends AbstractHTMLTemplatedElement {

    protected _thisElTemplateEl = <HTMLTemplateElement>document.getElementById("js-message-file-temp");
    protected declare _thisEl: HTMLAnchorElement;
    protected _filenameEl: HTMLElement;

    protected _filename: string;
    protected _url: string;

    public constructor(parentEl: HTMLElement, filename: string, url: string) {
        super(parentEl);
        this._filename = filename;
        this._url = url;
    }

    public _initChildEls(): void {
        this._thisEl.href = this._url;

        this._filenameEl = this._thisEl.querySelector(".chat__file__name");
        this._filenameEl.textContent = this._filename;
    }

}
