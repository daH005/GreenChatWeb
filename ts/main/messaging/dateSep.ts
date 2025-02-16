import { AbstractHTMLTemplatedElement } from "./abstractTemplatedElement.js";

export class HTMLDateSep extends AbstractHTMLTemplatedElement {

    protected _dateStr: string;
    protected _templateEl = <HTMLTemplateElement>document.getElementById("js-chat-date-sep-temp");

    public constructor(parentEl: HTMLElement, dateStr: string) {
        super(parentEl);
        this._dateStr = dateStr;
    }

    public _initChildEls(): void {
        this._el.textContent = this._dateStr;
    }

}
