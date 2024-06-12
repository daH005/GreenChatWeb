import { thisUser } from "../../common/thisUser.js";
import { User } from "../../common/apiDataInterfaces.js";
import { sendWebSocketMessage } from "../websocket/init.js";
import { WebSocketMessageType } from "../websocket/messageTypes.js";
import { setAvatar } from "../avatars.js";
import { sendMessageToWebSocketAndClearInput } from "./websocketFunctions.js";
import { AbstractHTMLChat } from "./abstractChat.js";

export class HTMLPrivateFakeChat extends AbstractHTMLChat {
    
    protected _initThisEl(): void {
        this._thisEl = document.getElementById("js-new-chat");
    }

    protected _initChildEls(): void {
        super._initChildEls();
        this._buttonEl.onclick = () => {
            if (!this._messageTextIsMeaningful(this._textareaEl.value)) {
                return;
            }
            sendMessageToWebSocketAndClearInput({
                type: WebSocketMessageType.NEW_CHAT,
                data: {
                    text: this._textareaEl.value,
                    usersIds: [thisUser.id, this._interlocutor.id],
                }
            }, this._textareaEl);
        }
    }

    public open(): void {
        super.open();

        sendWebSocketMessage({
            type: WebSocketMessageType.ONLINE_STATUS_TRACING_ADDING,
            data: {
                userId: this._interlocutor.id,
            }
        });

        this._nameEl.textContent = this._interlocutor.firstName + " " + this._interlocutor.lastName;
        setAvatar(this._avatarEl, this._interlocutor.id);
    }

    public close(): void {
        super.close();
        this._interlocutor = null;
    }

    public setInterlocutor(interlocutor: User): void {
        this._interlocutor = interlocutor;
    }

}

export var privateFakeChat: HTMLPrivateFakeChat = new HTMLPrivateFakeChat();
privateFakeChat.init();
