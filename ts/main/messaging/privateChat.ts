import { APIMessage, APIUser } from "../../common/apiDataInterfaces.js";
import { requestNewChat } from "../../common/http/functions.js";
import { thisUser } from "../../common/thisUser.js";
import { makeUserAvatarURL } from "../avatars.js";
import { HTMLChatLink } from "./chatLink.js";
import { AbstractHTMLChat } from "./abstractChat.js";

export class HTMLPrivateChat extends AbstractHTMLChat {

    protected _templateEl = <HTMLTemplateElement>document.getElementById("js-chat-temp");
    protected _onlineStatusEl: HTMLElement;

    protected static _byInterlocutorIds: Record<number, HTMLPrivateChat> = {};
    protected static _NEW_CHAT_TEMP_ID: number = -1;
    protected _isNotCreatedOnServer: boolean;

    protected _interlocutor: APIUser;

    public constructor(id: number, unreadCount: number, interlocutor: APIUser) {
        let interlocutorFullName: string = interlocutor.firstName + " " + interlocutor.lastName;
        super(id, interlocutorFullName, unreadCount);

        this._interlocutor = interlocutor;
        HTMLPrivateChat._byInterlocutorIds[this._interlocutor.id] = this;

        if (id == HTMLPrivateChat._NEW_CHAT_TEMP_ID) {
            this._isNotCreatedOnServer = true;
            this._fullyLoaded = true;
        } else {
            this._isNotCreatedOnServer = false;
        }
    }

    public static new(interlocutor: APIUser): HTMLPrivateChat {
        return new HTMLPrivateChat(HTMLPrivateChat._NEW_CHAT_TEMP_ID, 0, interlocutor);
    }

    public static byInterlocutorId(interlocutorId: number): HTMLPrivateChat | null {
        return HTMLPrivateChat._byInterlocutorIds[interlocutorId];
    }

    protected _initChildEls(): void {
        super._initChildEls();
        this._link.hide();
        this._onlineStatusEl = this._el.querySelector(".avatar");
        this.updateOnlineStatus(this._interlocutor.isOnline);
    }

    protected async _makeAvatarURL(): Promise<string> {
        return await makeUserAvatarURL(this._interlocutor.id);
    }

    protected async _sendTyping(): Promise<void> {
        if (!this._isNotCreatedOnServer) {
            await super._sendTyping();
        }
    }

    protected async _sendMessage(): Promise<void> {
        if (this._isNotCreatedOnServer) {
            await requestNewChat({
                userIds: [thisUser.id, this._interlocutor.id],
            });
        } else {
            await super._sendMessage();
        }
    }

    public async setAsCreatedOnServer(): Promise<void> {
        this._isNotCreatedOnServer = false;
        await this._sendMessage();
    }

    public setId(id: number): void {
        this._id = id;
        AbstractHTMLChat._byIds[id] = this;
    }

    public showLink(): void {
        this._link.show();
    }

    public updateOnlineStatus(isOnline: boolean): void {
        this._onlineStatusEl.classList.toggle("avatar--active", isOnline);
        this._link.updateOnlineStatus(isOnline);
    }

}
