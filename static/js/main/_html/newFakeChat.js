import { user } from "../_user.js";
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
        this.childEls.backLink = document.getElementById("js-new-chat-back-link");
        this.childEls.backLink.onclick = () => {
            this.close();
        }

        this.childEls.name = document.getElementById("js-new-chat-name");
        this.childEls.input = document.getElementById("js-new-chat-input");

        this.childEls.sendButton = document.getElementById("js-new-chat-button");
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
        this.interlocutorUser = interlocutorUser;
        this.childEls.name.textContent = this.interlocutorUser.firstName;
    }

    close() {
        super.close();
        this.interlocutorUser = null;
    }

}

export var newFakeChat = new NewFakeChat();
