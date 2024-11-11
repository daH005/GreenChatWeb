import { AbstractHTMLTemplatedElement } from "./abstractChatElement.js";

export class HTMLDateSep extends AbstractHTMLTemplatedElement {

    protected _dateStr: string;
    protected _thisElTemplateEl = <HTMLTemplateElement>document.getElementById("js-chat-date-sep-temp");

    public constructor(parentEl: HTMLElement, dateStr: string) {
        super(parentEl);
        this._dateStr = dateStr;
    }

    public _initChildEls(): void {
        this._thisEl.textContent = this._dateStr;
    }

}
