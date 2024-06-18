import { isMobile } from "../../common/mobileDetecting.js";
import { AbstractHTMLChatElementFacade } from "./abstractChatElement.js";
export class AbstractHTMLChat extends AbstractHTMLChatElementFacade {
    static _chatParentEl = document.getElementById("js-loaded-chats");
    _thisElTemplateEl = document.getElementById("js-chat-temp");
    _backLinkEl;
    _avatarEl;
    _nameEl;
    _textareaEl;
    _buttonEl;
    _onlineStatusEl;
    _interlocutor;
    _isOpened = false;
    constructor(interlocutor = null) {
        super(AbstractHTMLChat._chatParentEl);
        this._interlocutor = interlocutor;
    }
    open() {
        this._thisEl.classList.remove("chat--hidden");
        if (!isMobile) {
            this._textareaEl.focus();
        }
        this._isOpened = true;
    }
    close() {
        this._thisEl.classList.add("chat--hidden");
        this._isOpened = false;
    }
    get isOpened() {
        return this._isOpened;
    }
    isOpenedWith(interlocutorId) {
        if (!this._interlocutor) {
            return false;
        }
        return interlocutorId == this._interlocutor.id;
    }
    updateOnlineStatus(isOnline) {
        this._onlineStatusEl.classList.toggle("avatar--active", isOnline);
    }
    _messageTextIsMeaningful(text) {
        return text.replaceAll("\n", "").replaceAll(" ", "") != "";
    }
    _initChildEls() {
        super._initChildEls();
        this._backLinkEl = this._thisEl.querySelector(".chat__back-link");
        this._backLinkEl.onclick = () => {
            this.close();
        };
        this._avatarEl = this._thisEl.querySelector(".avatar");
        this._nameEl = this._thisEl.querySelector(".chat__name");
        this._onlineStatusEl = this._thisEl.querySelector(".avatar");
        this._textareaEl = this._thisEl.querySelector("textarea");
        this._buttonEl = this._thisEl.querySelector("button");
    }
}
