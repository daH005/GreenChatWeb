import { thisUser } from "../../common/thisUser.js";
import { sendWebSocketMessage } from "../websocket/init.js";
import { WebSocketMessageType } from "../websocket/messageTypes.js";
import { setAvatar } from "../avatars.js";
import { sendMessageToWebSocketAndClearInput } from "./websocketFunctions.js";
import { AbstractHTMLChat } from "./abstractChat.js";
export class HTMLPrivateFakeChat extends AbstractHTMLChat {
    _initThisEl() {
        this._thisEl = document.getElementById("js-new-chat");
    }
    _initChildEls() {
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
        };
    }
    open() {
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
    close() {
        super.close();
        this._interlocutor = null;
    }
    setInterlocutor(interlocutor) {
        this._interlocutor = interlocutor;
    }
}
export var privateFakeChat = new HTMLPrivateFakeChat();
privateFakeChat.init();
