import { dateToTimeStr } from "../datetime.js";
import { makeHyperlinks, makeHighlights } from "../messageTextHighlighting.js";
import { AbstractHTMLChatElementFacade } from "./abstractChatElement.js";
export class HTMLChatMessage extends AbstractHTMLChatElementFacade {
    _thisElTemplateEl = document.getElementById("js-chat-message-temp");
    _userNameEl;
    _textEl;
    _timeEl;
    _id;
    _text;
    _isRead;
    _creatingDatetime;
    _user;
    _fromThisUser;
    constructor(parentEl, id, text, isRead, creatingDatetime, user, fromThisUser) {
        super(parentEl);
        this._id = id;
        this._text = text;
        this._isRead = isRead;
        this._creatingDatetime = creatingDatetime;
        this._user = user;
        this._fromThisUser = fromThisUser;
    }
    _initChildEls() {
        this._userNameEl = this._thisEl.querySelector(".chat__message__name");
        this._userNameEl.textContent = this._user.firstName;
        this._textEl = this._thisEl.querySelector(".chat__message__text");
        this._textEl.textContent = this._text;
        this._textEl.innerHTML = this._formattedMessageTextHtml(this._textEl.innerHTML);
        this._timeEl = this._thisEl.querySelector(".chat__message__time");
        this._timeEl.textContent = this._timeStr();
    }
    _formattedMessageTextHtml(html) {
        html = makeHyperlinks(html);
        html = makeHighlights(html);
        return html;
    }
    _timeStr() {
        return dateToTimeStr(this._creatingDatetime);
    }
    get id() {
        return this._id;
    }
    get fromThisUser() {
        return this._fromThisUser;
    }
    get isRead() {
        return this._isRead;
    }
    setAsRead() {
        this._thisEl.classList.remove("chat__message--unread");
        this._isRead = true;
    }
    getBoundingClientRect() {
        return this._thisEl.getBoundingClientRect();
    }
}
export class HTMLChatMessageFromThisUser extends HTMLChatMessage {
    _initThisEl(prepend) {
        super._initThisEl(prepend);
        this._thisEl.classList.add("chat__message--self");
        if (!this._isRead) {
            this._thisEl.classList.add("chat__message--unread");
        }
    }
}
