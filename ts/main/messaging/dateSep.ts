import { dateToDateStr } from "../datetime.js";
import { AbstractHTMLTemplatedElement } from "./abstractTemplatedElement.js";

export class HTMLDateSep extends AbstractHTMLTemplatedElement {

    protected static _byIds: Record<string, HTMLDateSep> = {};
    protected _templateEl = <HTMLTemplateElement>document.getElementById("js-chat-date-sep-temp");

    protected _id: string;
    protected _date: Date;

    public constructor(parentEl: HTMLElement, id: string, date: Date) {
        super(parentEl);
        this._id = id;
        this._date = date;

        HTMLDateSep._byIds[this._id] = this;
    }

    public static byId(id: string): HTMLDateSep | null {
        return HTMLDateSep._byIds[id];
    }

    public _initChildEls(): void {
        this._el.textContent = dateToDateStr(this._date);
    }

    public pushUp(messageEl: HTMLElement): void {
        this._parentEl.insertBefore(this._el, messageEl);
    }

}
