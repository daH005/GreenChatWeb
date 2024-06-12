import { setAvatar } from "../avatars.js";
import { AbstractHTMLChatElementFacade } from "./abstractChatElement.js";
export class HTMLChatLink extends AbstractHTMLChatElementFacade {
    _thisElTemplateEl = document.getElementById("js-chat-link-temp");
    static _chatLinkParentEl = document.getElementById("js-all-chats-links");
    _avatarEl;
    _chatNameEl;
    _onlineStatusEl;
    _lastMessageFromThisUserMarkEl;
    _lastMessageTextEl;
    _lastMessageDateEl;
    _unreadCountEl;
    _interlocutorId;
    _chatName;
    constructor(interlocutorId, chatName) {
        super(HTMLChatLink._chatLinkParentEl);
        this._interlocutorId = interlocutorId;
        this._chatName = chatName;
    }
    _initThisEl(prepend) {
        super._initThisEl(prepend);
        this._thisEl.onclick = () => {
            this.openChat();
        };
    }
    _initChildEls() {
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
    openChat() { }
    open() {
        this._thisEl.classList.add("chat-link--active");
    }
    close() {
        this._thisEl.classList.remove("chat-link--active");
    }
    updateLastMessageFromThisUserMark(fromThisUser) {
        let value;
        if (fromThisUser) {
            value = "";
        }
        else {
            value = "none";
        }
        this._lastMessageFromThisUserMarkEl.style.display = value;
    }
    updateTextAndDate(text, dateStr) {
        this._lastMessageTextEl.textContent = text;
        this._lastMessageDateEl.textContent = dateStr;
        this._parentEl.prepend(this._thisEl);
    }
    updateUnreadCount(count) {
        let result = String(count);
        if (!count) {
            result = "";
        }
        this._unreadCountEl.textContent = result;
    }
    updateOnlineStatus(isOnline) {
        this._onlineStatusEl.classList.toggle("avatar--active", isOnline);
    }
}
