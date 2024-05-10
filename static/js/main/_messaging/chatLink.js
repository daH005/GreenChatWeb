import { setAvatar } from "../_avatars.js";
import { AbstractChatElementFacade } from "./abs.js";

const chatLinkParentEl = document.getElementById("js-all-chats-links");
const chatLinkTempEl = document.getElementById("js-chat-link-temp");

const MAX_CHAT_LINK_TEXT_LENGTH = 15;

export class ChatLink extends AbstractChatElementFacade {

    _init(args) {
        this.parentChat = args.parentChat;
    }

    get parentEl() {
        return chatLinkParentEl;
    }

    get tempEl() {
        return chatLinkTempEl;
    }

    _makeEl() {
        super._makeEl();
        this.el.onclick = () => {
            this.parentChat.open();
        }
    }

    _makeChildEls() {
        this.childEls.avatar = this.el.querySelector(".avatar");
        setAvatar(this.childEls.avatar, this.data.interlocutor.id);

        this.childEls.name = this.el.querySelector(".chat-link__chat-name");
        this.childEls.name.textContent = this.data.name;

        this.childEls.onlineStatus = this.el.querySelector(".avatar");

        this.childEls.self = this.el.querySelector(".chat-link__last-message .chat-link__self");
        this.childEls.text = this.el.querySelector(".chat-link__last-message .chat-link__text");
        this.childEls.lastMessageDate = this.el.querySelector(".chat-link__date");

        this.childEls.unreadCount = this.el.querySelector(".chat-link__count");
    }

    update(data) {
        if (data.isSelf) {
            this.childEls.self.style = "";
        } else {
            this.childEls.self.style = "display: none;";
        }

        this.childEls.text.textContent = data.text;
        this.childEls.lastMessageDate.textContent = data.dateStr;

        this.parentEl.prepend(this.el);
    }

    updateUnreadCount(count) {
        let result = String(count);
        if (!count) {
            result = "";
        }
        this.childEls.unreadCount.textContent = result;
    }

    updateOnlineStatus(status) {
        this.childEls.onlineStatus.classList.toggle("avatar--active", status);
    }

}
