import { ChatMessage, User } from "../../common/apiDataInterfaces.js";
import { thisUser } from "../../common/thisUser.js";
import { makeUserAvatarURL } from "../avatars.js";
import { sendWebSocketMessage } from "../websocket/init.js";
import { WebSocketMessageType } from "../websocket/messageTypes.js";
import { HTMLChatLink } from "./chatLink.js";
import { AbstractHTMLChat } from "./abstractChat.js";

export class HTMLPrivateChat extends AbstractHTMLChat {

    protected _thisElTemplateEl = <HTMLTemplateElement>document.getElementById("js-chat-temp");
    protected _onlineStatusEl: HTMLElement;

    protected static _chatsByInterlocutorsIds: Record<number, HTMLPrivateChat> = {};
    protected static _NEW_CHAT_TEMP_ID: number = -1;
    protected _isNotCreatedOnServer: boolean;

    protected _interlocutor: User;

    public constructor(id: number, unreadCount: number, interlocutor: User) {
        let interlocutorFullName: string = interlocutor.firstName + " " + interlocutor.lastName;
        super(id, interlocutorFullName, unreadCount);

        HTMLPrivateChat._chatsByInterlocutorsIds[interlocutor.id] = this;
        this._interlocutor = interlocutor;

        if (id == HTMLPrivateChat._NEW_CHAT_TEMP_ID) {
            this._isNotCreatedOnServer = true;
            this._fullyLoaded = true;
        } else {
            this._isNotCreatedOnServer = false;
        }
    }

    public static newChat(interlocutor: User): HTMLPrivateChat {
        sendWebSocketMessage({
            type: WebSocketMessageType.ONLINE_STATUS_TRACING_ADDING,
            data: {
                userId: interlocutor.id,
            }
        });
        return new HTMLPrivateChat(HTMLPrivateChat._NEW_CHAT_TEMP_ID, 0, interlocutor);
    }

    public static getChatByInterlocutorId(interlocutorId: number): HTMLPrivateChat | null {
        return HTMLPrivateChat._chatsByInterlocutorsIds[interlocutorId];
    }

    protected _initChildEls(): void {
        super._initChildEls();
        this._link.hide();
        this._onlineStatusEl = this._thisEl.querySelector(".avatar");
    }

    protected async _makeAvatarURL(): Promise<string> {
        return await makeUserAvatarURL(this._interlocutor.id);
    }

    protected _sendTyping(): void {
        if (!this._isNotCreatedOnServer) {
            super._sendTyping();
        }
    }

    protected async _sendMessage(): Promise<void> {
        if (this._isNotCreatedOnServer) {
            sendWebSocketMessage({
                type: WebSocketMessageType.NEW_CHAT,
                data: {
                    userIds: [thisUser.id, this._interlocutor.id],
                }
            });
        } else {
            await super._sendMessage();
        }
    }

    public async setAsCreatedOnServer(): Promise<void> {
        this._isNotCreatedOnServer = false;
        await this._sendMessage();
    }

    public setId(chatId: number): void {
        this._id = chatId;
        AbstractHTMLChat._chatsByIds[chatId] = this;
    }

    public showLink(): void {
        this._link.show();
    }

    public updateOnlineStatus(isOnline: boolean): void {
        this._onlineStatusEl.classList.toggle("avatar--active", isOnline);
        this._link.updateOnlineStatus(isOnline);
    }

}
