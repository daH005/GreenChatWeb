import { User } from "../../common/apiDataInterfaces.js";
import { isMobile } from "../../common/mobileDetecting.js";
import { AbstractHTMLChatElementFacade } from "./abstractChatElement.js";

export abstract class AbstractHTMLChat extends AbstractHTMLChatElementFacade {

    protected static _chatParentEl: HTMLElement = document.getElementById("js-loaded-chats");
    protected _thisElTemplateEl: HTMLTemplateElement = <HTMLTemplateElement>document.getElementById("js-chat-temp");

    protected _backLinkEl: HTMLElement;
    protected _avatarEl: HTMLImageElement;
    protected _nameEl: HTMLElement;
    protected _textareaEl: HTMLTextAreaElement;
    protected _buttonEl: HTMLButtonElement;
    protected _onlineStatusEl: HTMLElement;

    protected _interlocutor: User | null;
    protected _isOpened: boolean = false;

    public constructor(interlocutor: User | null = null) {
        super(AbstractHTMLChat._chatParentEl);
        this._interlocutor = interlocutor;
    }

    public open(): void {
        this._thisEl.classList.remove("chat--hidden");
        if (!isMobile) {
            this._textareaEl.focus();
        }

        this._isOpened = true;
    }

    public close(): void {
        this._thisEl.classList.add("chat--hidden");
        this._isOpened = false;
    }

    public get isOpened(): boolean {
        return this._isOpened;
    }

    public isOpenedWith(interlocutorId: number): boolean {
        return interlocutorId == this._interlocutor.id;
    }

    public updateOnlineStatus(isOnline: boolean): void {
        this._onlineStatusEl.classList.toggle("avatar--active", isOnline);
    }

    protected _messageTextIsMeaningful(text: string): boolean {
        return text.replaceAll("\n", "").replaceAll(" ", "") != "";
    }

    protected _initChildEls() {
        super._initChildEls();
        this._backLinkEl = this._thisEl.querySelector(".chat__back-link");
        this._backLinkEl.onclick = () => {
            this.close();
        }

        this._avatarEl = this._thisEl.querySelector(".avatar");
        this._nameEl = this._thisEl.querySelector(".chat__name");
        this._onlineStatusEl = this._thisEl.querySelector(".avatar");

        this._textareaEl = this._thisEl.querySelector("textarea");
        this._buttonEl = this._thisEl.querySelector("button");
    }

}
