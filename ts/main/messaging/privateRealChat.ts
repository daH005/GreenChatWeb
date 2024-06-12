import { ChatMessage, User } from "../../common/apiDataInterfaces.js";
import { setAvatar } from "../avatars.js";
import { HTMLChatLink } from "./chatLink.js";
import { AbstractHTMLRealChat } from "./abstractRealChat.js";

export class HTMLPrivateRealChat extends AbstractHTMLRealChat {

    protected _thisElTemplateEl = <HTMLTemplateElement>document.getElementById("js-chat-temp");
    protected static _chatsByInterlocutorsIds = {};
    
    public constructor(id: number, lastMessage: ChatMessage, users: User[], unreadCount: number, interlocutor: User) {
        let interlocutorFullName: string = interlocutor.firstName + " " + interlocutor.lastName;
        super(id, interlocutorFullName, lastMessage, users, unreadCount, interlocutor);
        HTMLPrivateRealChat._chatsByInterlocutorsIds[interlocutor.id] = this;
    }

    public static getChatByInterlocutorId(interlocutorId: number): HTMLPrivateRealChat {
        return HTMLPrivateRealChat._chatsByInterlocutorsIds[interlocutorId];
    }

    protected _initChildEls(): void {
        this._link = new HTMLChatLink(this._interlocutor.id, this._name);
        this._link.openChat = () => {
            this.open();
        }
        this._link.init();
        this._link.updateUnreadCount(this._unreadCount);

        super._initChildEls();

        setAvatar(this._avatarEl, this._interlocutor.id);
        this.updateOnlineStatus(false);
    }

}
