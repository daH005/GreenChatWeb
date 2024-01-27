import { AbstractChatElementFacade } from "./abs.js";

const chatLinkParentEl = document.getElementById("js-all-chats-links");
const chatLinkTempEl = document.getElementById("js-chat-link-temp");

const MAX_CHAT_LINK_TEXT_LENGTH = 20;

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
        this.childEls.name = this.el.querySelector(".chat-link__chat-name");
        this.childEls.name.textContent = this.data.name;

        this.childEls.lastMessage = this.el.querySelector(".chat-link__last-message");
        this.childEls.lastMessageDate = this.el.querySelector(".chat-link__date");
    }

    update(data) {
        let text = data.text;
        if (text.length > MAX_CHAT_LINK_TEXT_LENGTH) {
            text = text.slice(0, MAX_CHAT_LINK_TEXT_LENGTH) + "...";
        }
        this.childEls.lastMessage.textContent = text;
        this.childEls.lastMessageDate.textContent = data.dateStr;

        this.parentEl.prepend(this.el);
    }

}
