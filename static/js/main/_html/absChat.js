import { AbstractChatElementFacade } from "./abs.js";

export class AbstractChat extends AbstractChatElementFacade {
    static curOpened = null;

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
        this.isOpened = true;
    }

    close() {
        this.el.classList.add("chat--hidden");
        AbstractChat._curOpened = null;
        this.isOpened = false;
    }

    updateOnlineStatus(isOnline) {
        if (isOnline) {
            this.childEls.onlineStatus.textContent = "в сети";
            this.childEls.onlineStatus.classList.add("is-online");
        } else {
            this.childEls.onlineStatus.textContent = "не в сети";
            this.childEls.onlineStatus.classList.remove("is-online");
        }
    }

}
