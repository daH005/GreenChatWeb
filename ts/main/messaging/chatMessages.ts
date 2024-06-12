import { User } from "../../common/apiDataInterfaces.js";
import { dateToTimeStr }  from "../datetime.js";
import { makeHyperlinks, makeHighlights } from "../messageTextHighlighting.js";
import { AbstractHTMLChatElementFacade } from "./abstractChatElement.js";

export class HTMLChatMessage extends AbstractHTMLChatElementFacade {

    protected _thisElTemplateEl = <HTMLTemplateElement>document.getElementById("js-chat-message-temp");
    protected _userNameEl: HTMLElement;
    protected _textEl: HTMLElement;
    protected _timeEl: HTMLElement;

    protected _id: number;
    protected _text: string;
    protected _isRead: boolean;
    protected _creatingDatetime: Date;
    protected _user: User;
    protected _fromThisUser: boolean;

    public constructor(parentEl: HTMLElement, id: number, text: string, isRead: boolean, creatingDatetime: Date, user: User, fromThisUser: boolean) {
        super(parentEl);
        this._id = id;
        this._text = text;
        this._isRead = isRead;
        this._creatingDatetime = creatingDatetime;
        this._user = user;
        this._fromThisUser = fromThisUser;
    }

    protected _initChildEls(): void {
        this._userNameEl = this._thisEl.querySelector(".chat__message__name");
        this._userNameEl.textContent = this._user.firstName;

        this._textEl = this._thisEl.querySelector(".chat__message__text");
        this._textEl.textContent = this._text;
        this._textEl.innerHTML = this._formattedMessageTextHtml(this._textEl.innerHTML);

        this._timeEl = this._thisEl.querySelector(".chat__message__time");
        this._timeEl.textContent = this._timeStr();
    }

    protected _formattedMessageTextHtml(html: string): string {
        html = makeHyperlinks(html);
        html = makeHighlights(html);
        return html;
    }

    protected _timeStr(): string {
        return dateToTimeStr(this._creatingDatetime);
    }

    public get id(): number {
        return this._id;
    }

    public get fromThisUser(): boolean {
        return this._fromThisUser;
    }

    public get isRead(): boolean {
        return this._isRead;
    }

    public setAsRead(): void {
        this._thisEl.classList.remove("chat__message--unread");
    }

    public getBoundingClientRect(): DOMRect {
        return this._thisEl.getBoundingClientRect();
    }

}

export class HTMLChatMessageFromThisUser extends HTMLChatMessage {
    
    protected _initThisEl(prepend: boolean) {
        super._initThisEl(prepend);

        this._thisEl.classList.add("chat__message--self");
        if (!this._isRead) {
            this._thisEl.classList.add("chat__message--unread");
        }
    }

}
