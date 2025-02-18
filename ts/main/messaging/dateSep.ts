import { dateToDateStr } from "../datetime.js";
import { AbstractHTMLTemplatedElement } from "./abstractTemplatedElement.js";

export class HTMLDateSep extends AbstractHTMLTemplatedElement {

    protected static _byIds: Record<string, HTMLDateSep> = {};
    protected _templateEl = <HTMLTemplateElement>document.getElementById("js-chat-date-sep-temp");

    protected _id: string;
    protected _creatingDatetime: Date;

    public constructor(parentEl: HTMLElement, id: string, creatingDatetime: Date) {
        super(parentEl);
        this._id = id;
        this._creatingDatetime = creatingDatetime;

        HTMLDateSep._byIds[this._id] = this;
    }

    public static byId(id: string): HTMLDateSep | null {
        return HTMLDateSep._byIds[id];
    }

    public _initChildEls(): void {
        this._el.textContent = dateToDateStr(this._creatingDatetime);
    }

    public get creatingDatetime(): Date {
        return this._creatingDatetime;
    }

    public update(messageEl: HTMLElement, creatingDatetime: Date): void {
        this._parentEl.insertBefore(this._el, messageEl);
        this._creatingDatetime = creatingDatetime;
    }

}
