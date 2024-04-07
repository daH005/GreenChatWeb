import { isMobile } from "../../_mobDetecting.js";
import { AbstractChatElementFacade } from "./abs.js";

export class AbstractChat extends AbstractChatElementFacade {
    static curOpened = null;
    static interlocutorsChats = {};

    _init() {
        this.isOpened = false;
    }

    _textMessageIsMeaningful(text) {
        return text.replaceAll("\n", "").replaceAll(" ", "") != "";
    }

    open() {
        if (AbstractChat.curOpened) {
            AbstractChat.curOpened.close();
        }
        AbstractChat.curOpened = this;

        this.el.classList.remove("chat--hidden");
        if (!isMobile) {
            this.childEls.input.focus();
        }

        this.isOpened = true;
    }

    close() {
        this.el.classList.add("chat--hidden");
        AbstractChat.curOpened = null;
        this.isOpened = false;
    }

    updateOnlineStatus(status) {
        this.childEls.onlineStatus.classList.toggle("avatar--active", status);
    }

}
