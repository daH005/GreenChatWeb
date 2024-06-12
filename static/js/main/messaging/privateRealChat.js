import { setAvatar } from "../avatars.js";
import { HTMLChatLink } from "./chatLink.js";
import { AbstractHTMLRealChat } from "./abstractRealChat.js";
export class HTMLPrivateRealChat extends AbstractHTMLRealChat {
    _thisElTemplateEl = document.getElementById("js-chat-temp");
    static _chatsByInterlocutorsIds = {};
    constructor(id, lastMessage, users, unreadCount, interlocutor) {
        let interlocutorFullName = interlocutor.firstName + " " + interlocutor.lastName;
        super(id, interlocutorFullName, lastMessage, users, unreadCount, interlocutor);
        HTMLPrivateRealChat._chatsByInterlocutorsIds[interlocutor.id] = this;
    }
    static getChatByInterlocutorId(interlocutorId) {
        return HTMLPrivateRealChat._chatsByInterlocutorsIds[interlocutorId];
    }
    _initChildEls() {
        this._link = new HTMLChatLink(this._interlocutor.id, this._name);
        this._link.openChat = () => {
            this.open();
        };
        this._link.init();
        this._link.updateUnreadCount(this._unreadCount);
        super._initChildEls();
        setAvatar(this._avatarEl, this._interlocutor.id);
        this.updateOnlineStatus(false);
    }
}
