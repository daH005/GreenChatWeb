import { setAvatar } from "../avatars.js";
import { AbstractHTMLChatElementFacade } from "./abstractChatElement.js";

export class HTMLChatLink extends AbstractHTMLChatElementFacade {

    protected _thisElTemplateEl = <HTMLTemplateElement>document.getElementById("js-chat-link-temp");

    protected static _chatLinkParentEl: HTMLElement = document.getElementById("js-all-chats-links");
    protected _avatarEl: HTMLImageElement;
    protected _chatNameEl: HTMLElement;
    protected _onlineStatusEl: HTMLElement;
    protected _lastMessageFromThisUserMarkEl: HTMLElement;
    protected _lastMessageTextEl: HTMLElement;
    protected _lastMessageDateEl: HTMLElement;
    protected _unreadCountEl: HTMLElement;

    protected _interlocutorId: number;
    protected _chatName: string;

    public constructor(interlocutorId: number, chatName: string) {
        super(HTMLChatLink._chatLinkParentEl);
        this._interlocutorId = interlocutorId;
        this._chatName = chatName;
    }

    protected _initThisEl(prepend: boolean): void {
        super._initThisEl(prepend);
        this._thisEl.onclick = () => {
            this.openChat();
        }
    }

    public _initChildEls(): void {
        this._avatarEl = this._thisEl.querySelector(".avatar");
        setAvatar(this._avatarEl, this._interlocutorId);

        this._chatNameEl = this._thisEl.querySelector(".chat-link__chat-name");
        this._chatNameEl.textContent = this._chatName;

        this._onlineStatusEl = this._thisEl.querySelector(".avatar");

        this._lastMessageFromThisUserMarkEl = this._thisEl.querySelector(".chat-link__last-message .chat-link__self");
        this._lastMessageTextEl = this._thisEl.querySelector(".chat-link__last-message .chat-link__text");
        this._lastMessageDateEl = this._thisEl.querySelector(".chat-link__date");

        this._unreadCountEl = this._thisEl.querySelector(".chat-link__count");
    }

    public openChat(): void {}

    public open(): void {
        this._thisEl.classList.add("chat-link--active");
    }

    public close(): void {
        this._thisEl.classList.remove("chat-link--active");
    }

    public updateLastMessageFromThisUserMark(fromThisUser: boolean): void {
        let value: string;
        if (fromThisUser) {
            value = "";
        } else {
            value = "none";
        }
        this._lastMessageFromThisUserMarkEl.style.display = value;
    }

    public updateTextAndDate(text: string, dateStr: string): void {
        this._lastMessageTextEl.textContent = text;
        this._lastMessageDateEl.textContent = dateStr;
        this._parentEl.prepend(this._thisEl);
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

}
