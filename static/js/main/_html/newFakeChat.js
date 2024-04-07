import { user } from "../_user.js";
import { websocket } from "../_websocket.js";
import { sendMessageToWebSocketAndClearInput } from "./common.js";
import { AbstractChat } from "./absChat.js";

export class NewFakeChat extends AbstractChat {

    _init(args) {
        super._init(args);
        this.interlocutorUser = null;
    }

    _makeEl() {
        this.el = document.getElementById("js-new-chat");
    }

    _makeChildEls() {
        this.childEls.backLink = this.el.querySelector(".chat__back-link");
        this.childEls.backLink.onclick = () => {
            this.close();
        }

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
                    usersIds: [user.id, this.interlocutorUser.id],
                }
            }, this.childEls.input);
        }
    }

    open(interlocutorUser) {
        super.open();

        websocket.sendJSON({
            type: "onlineStatusTracingAdding",
            data: {
                userId: interlocutorUser.id,
            }
        });

        AbstractChat.interlocutorsChats[interlocutorUser.id] = this;

        this.interlocutorUser = interlocutorUser;
        this.childEls.name.textContent = this.interlocutorUser.firstName + " " + this.interlocutorUser.lastName;
    }

    close() {
        super.close();

        if (AbstractChat.interlocutorsChats[this.interlocutorUser.id] == this) {
            AbstractChat.interlocutorsChats[this.interlocutorUser.id] = null;
        }

        this.interlocutorUser = null;
    }

}

export var newFakeChat = new NewFakeChat();
