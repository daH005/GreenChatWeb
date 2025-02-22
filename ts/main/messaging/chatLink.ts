import { CURRENT_LABELS } from "../../common/languages/labels.js";
import { dateToDateStr } from "../datetime.js";
import { AbstractHTMLTemplatedElement } from "./abstractTemplatedElement.js";
import { AbstractHTMLChat } from "./abstractChat.js";

export class HTMLChatLink extends AbstractHTMLTemplatedElement {

    protected static _parentEl: HTMLElement;
    protected _templateEl = <HTMLTemplateElement>document.getElementById("js-chat-link-temp");

    protected _avatarEl: HTMLImageElement;
    protected _chatNameEl: HTMLElement;
    protected _onlineStatusEl: HTMLElement;
    protected _lastMessageFromThisUserMarkEl: HTMLElement;
    protected _lastMessageTextEl: HTMLElement;
    protected _lastMessageDateEl: HTMLElement;
    protected _unreadCountEl: HTMLElement;

    protected _chat: AbstractHTMLChat;
    protected _avatarURL: string;
    protected _chatName: string;

    public constructor(chat: AbstractHTMLChat, chatName: string, avatarURL: string) {
        super(HTMLChatLink._parentEl);
        this._chat = chat;
        this._chatName = chatName;
        this._avatarURL = avatarURL;
    }

    public static setParentEl(parentEl: HTMLElement): void {
        HTMLChatLink._parentEl = parentEl;
    }

    protected _initThisEl(prepend: boolean): void {
        super._initThisEl(prepend);
        this._el.onclick = this._chat.open.bind(this._chat);
    }

    protected _initChildEls(): void {
        this._avatarEl = this._el.querySelector(".avatar");
        this._avatarEl.src = this._avatarURL;

        this._chatNameEl = this._el.querySelector(".chat-link__chat-name");
        this._chatNameEl.textContent = this._chatName;

        this._onlineStatusEl = this._el.querySelector(".avatar");

        this._lastMessageFromThisUserMarkEl = this._el.querySelector(".chat-link__last-message .chat-link__self");
        this._lastMessageTextEl = this._el.querySelector(".chat-link__last-message .chat-link__text");
        this._lastMessageDateEl = this._el.querySelector(".chat-link__date");

        this._unreadCountEl = this._el.querySelector(".chat-link__count");
    }

    public open(): void {
        this._el.classList.add("chat-link--active");
    }

    public close(): void {
        this._el.classList.remove("chat-link--active");
    }

    public pushUp(): void {
        this._parentEl.prepend(this._el);
    }

    public updateTextAndDate(text: string, date: Date, fromThisUser: boolean): void {
        this._lastMessageTextEl.textContent = text;
        this._lastMessageDateEl.textContent = dateToDateStr(date);
        this._updateLastMessageFromThisUserMark(fromThisUser);
    }

    protected _updateLastMessageFromThisUserMark(fromThisUser: boolean): void {
        let value: string;
        if (fromThisUser) {
            value = CURRENT_LABELS.you;
        } else {
            value = "";
        }
        this._lastMessageFromThisUserMarkEl.textContent = value;
    }

    public updateUnreadCount(count: number): void {
        let result = String(count);
        if (!count) {
            result = "";
        }
        this._unreadCountEl.textContent = result;
    }

    public updateOnlineStatus(isOnline: boolean): void {
        this._onlineStatusEl.classList.toggle("avatar--active", isOnline);
    }

    public hide(): void {
        this._toggle(true);
    }

    public show(): void {
        this._toggle(false);
    }

    protected _toggle(isHidden: boolean): void {
        this._el.classList.toggle("chat-link--hidden", isHidden);
    }

}
