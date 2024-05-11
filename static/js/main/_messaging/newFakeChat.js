import { user } from "../_user.js";
import { websocket } from "../_websocket.js";
import { setAvatar } from "../_avatars.js";
import { sendMessageToWebSocketAndClearInput } from "./common.js";
import { AbstractChat } from "./absChat.js";

export class NewFakeChat extends AbstractChat {

    _init(args) {
        super._init(args);
        this.interlocutor = null;
    }

    _makeEl() {
        this.el = document.getElementById("js-new-chat");
    }

    _makeChildEls() {
        this.childEls.backLink = this.el.querySelector(".chat__back-link");
        this.childEls.backLink.onclick = () => {
            this.close();
        }

        this.childEls.avatar = this.el.querySelector(".avatar");
        this.childEls.name = this.el.querySelector(".chat__name");
        this.childEls.onlineStatus = this.el.querySelector(".avatar");

        this.childEls.input = this.el.querySelector("textarea");
        this.childEls.sendButton = this.el.querySelector("button");
        this.childEls.sendButton.onclick = () => {
            if (!this._textMessageIsMeaningful(this.childEls.input.value)) {
                return;
            }
            sendMessageToWebSocketAndClearInput({
                type: "newChat",
                data: {
                    text: this.childEls.input.value,
                    usersIds: [user.id, this.interlocutor.id],
                }
            }, this.childEls.input);
        }
    }

    open(interlocutor) {
        super.open();

        websocket.sendJSON({
            type: "onlineStatusTracingAdding",
            data: {
                userId: interlocutor.id,
            }
        });

        AbstractChat.interlocutorsChats[interlocutor.id] = this;

        this.interlocutor = interlocutor;
        this.childEls.name.textContent = this.interlocutor.firstName + " " + this.interlocutor.lastName;
        setAvatar(this.childEls.avatar, this.interlocutor.id);
    }

    close() {
        super.close();

        if (AbstractChat.interlocutorsChats[this.interlocutor.id] == this) {
            AbstractChat.interlocutorsChats[this.interlocutor.id] = null;
        }

        this.interlocutor = null;
    }

}

export var newFakeChat = new NewFakeChat();
