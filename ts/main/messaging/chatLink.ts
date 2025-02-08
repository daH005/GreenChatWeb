import { CURRENT_LABELS } from "../../common/languages/labels.js";
import { AbstractHTMLTemplatedElement } from "./abstractTemplatedElement.js";
import { AbstractHTMLChat } from "./abstractChat.js";

export class HTMLChatLink extends AbstractHTMLTemplatedElement {

    protected static _chatLinkParentEl: HTMLElement;
    protected _thisElTemplateEl = <HTMLTemplateElement>document.getElementById("js-chat-link-temp");

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
        super(HTMLChatLink._chatLinkParentEl);
        this._chat = chat;
        this._chatName = chatName;
        this._avatarURL = avatarURL;
    }

    public static setParentEl(parentEl: HTMLElement): void {
        HTMLChatLink._chatLinkParentEl = parentEl;
    }

    protected _initThisEl(prepend: boolean): void {
        super._initThisEl(prepend);
        this._thisEl.onclick = this._chat.open.bind(this._chat);
    }

    public _initChildEls(): void {
        this._avatarEl = this._thisEl.querySelector(".avatar");
        this._avatarEl.src = this._avatarURL;

        this._chatNameEl = this._thisEl.querySelector(".chat-link__chat-name");
        this._chatNameEl.textContent = this._chatName;

        this._onlineStatusEl = this._thisEl.querySelector(".avatar");

        this._lastMessageFromThisUserMarkEl = this._thisEl.querySelector(".chat-link__last-message .chat-link__self");
        this._lastMessageTextEl = this._thisEl.querySelector(".chat-link__last-message .chat-link__text");
        this._lastMessageDateEl = this._thisEl.querySelector(".chat-link__date");

        this._unreadCountEl = this._thisEl.querySelector(".chat-link__count");
    }

    public open(): void {
        this._thisEl.classList.add("chat-link--active");
    }

    public close(): void {
        this._thisEl.classList.remove("chat-link--active");
    }

    public updateLastMessageFromThisUserMark(fromThisUser: boolean): void {
        let value: string;
        if (fromThisUser) {
            value = CURRENT_LABELS.you;
        } else {
            value = "";
        }
        this._lastMessageFromThisUserMarkEl.textContent = value;
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

    public hide(): void {
        this._toggle(true);
    }

    public show(): void {
        this._toggle(false);
    }

    protected _toggle(isHidden: boolean): void {
        this._thisEl.classList.toggle("chat-link--hidden", isHidden);
    }

}
