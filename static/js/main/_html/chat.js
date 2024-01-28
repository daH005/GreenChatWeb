import { choose } from "../../_random.js";
import { requestChatHistory } from "../../_http.js";
import { dateToDateStr, normalizeDateTimezone }  from "../../_datetime.js";
import { newMessageSound } from "../../_audio.js";
import { userInWindow } from "../../_userInWindowChecking.js";
import { user } from "../_user.js";
import { ChatMessage } from "./chatMessage.js";
import { ChatLink } from "./chatLink.js";
import { DateSep } from "./dateSep.js";
import { websocket } from "../_websocket.js";
import { sendMessageToWebSocketAndClearInput } from "./common.js";
import { AbstractChat } from "./absChat.js";

const chatParentEl = document.getElementById("js-loaded-chats");
const chatTempEl = document.getElementById("js-chat-temp");
const PHRASES = [
    "Что же написать...",
    "Хм...",
    "Короче, да...",
    "В общем и целом...",
    "Ваше слово?",
    "Впиши в меня текст!",
    "Наполни меня текстом!",
    "Ты меня любишь, а я тебя - текст!",
];

export class Chat extends AbstractChat {
    static interlocutorsChats = {};

    _init() {
        super._init();
        this.messages = [];
        this.fullyLoaded = false;
        this.datesSeps = {};

        this.name = null;
        this.interlocutorUser = null;
        this.link = null;
        this.topDateStr = null;
        this.bottomDateStr = null;
        this.typingTimeoutId = null;

        this.id = this.data.fromApi.id;
        this._defineInterlocutorUser();
        this._defineName();
    }

    get parentEl() {
        return chatParentEl;
    }

    get tempEl() {
        return chatTempEl;
    }

    _makeChildEls() {
        this.childEls.name = this.el.querySelector(".chat__name");
        this.updateName(false);

        this.childEls.backLink = this.el.querySelector(".chat__back-link");
        this.childEls.backLink.onclick = () => {
            this.close();
        }

        this.childEls.messages = this.el.querySelector(".chat__messages");

        this.childEls.input = this.el.querySelector("textarea");
        this.childEls.input.addEventListener("input", () => {
            websocket.sendJSON({
                type: "newChatMessageTyping",
                data: {
                    chatId: this.id,
                }
            });
        });
        this.childEls.input.setAttribute("placeholder", choose(PHRASES));

        this.childEls.sendButton = this.el.querySelector("button");
        this.childEls.sendButton.onclick = () => {
            if (!this._textMessageIsMeaningful(this.childEls.input.value)) {
                return;
            }
            sendMessageToWebSocketAndClearInput({
                type: "newChatMessage",
                data: {
                    chatId: this.id,
                    text: this.childEls.input.value,
                }
            }, this.childEls.input);
        }

        this.childEls.typing = this.el.querySelector(".chat__interlocutor-write-hint");

        this.link = new ChatLink({
            parentChat: this,
            data: {
                name: this.name,
            },
        });

        if (this.data.fromApi.lastMessage) {
            this.addMessage(this.data.fromApi.lastMessage, false, true);
        }
    }

    _defineName() {
        if (this.data.fromApi.isGroup) {
            this.name = this.data.fromApi.name;
        } else {
            this.name = this.interlocutorUser.firstName;
        }
    }

    _defineInterlocutorUser() {
        for (let i in this.data.fromApi.users) {
            if (this.data.fromApi.users[i].id != user.id) {
                this.interlocutorUser = this.data.fromApi.users[i];
                Chat.interlocutorsChats[this.interlocutorUser.id] = this;
                break;
            }
        }
    }

    addMessage(apiData, prepend=false, isFirst=false) {
        apiData.creatingDatetime = new Date(apiData.creatingDatetime);
        normalizeDateTimezone(apiData.creatingDatetime);

        let dateStr = dateToDateStr(apiData.creatingDatetime);

        if (!isFirst) {
            let dateStr_;
            if (prepend && this.bottomDateStr != dateStr) {
                dateStr_ = this.bottomDateStr;
            } else if (!prepend && this.topDateStr != dateStr) {
                dateStr_ = dateStr;
            }
            if (dateStr_) {
                this._addDateSep(apiData.id, prepend, dateStr_);
            }
        }

        let scrollingIsBottom = false;
        if (this._scrollingIsBottom()) {
            scrollingIsBottom = true;
        }

        let isSelf = user.id == apiData.user.id;
        this.messages.push(new ChatMessage({
            parentEl: this.childEls.messages,
            prepend,
            data: {
                fromApi: apiData,
                isSelf,
            },
        }));

        if (scrollingIsBottom) {
            this._scrollToBottom();
        }

        if (isFirst) {
            this.topDateStr = dateStr;
            this.bottomDateStr = dateStr;
        } else if (prepend) {
            this.bottomDateStr = dateStr;
        } else {
            this.topDateStr = dateStr;
        }

        if (!isFirst && !prepend && !isSelf && (!userInWindow() || !this.isOpened)) {
            newMessageSound.play();
        }

        if (!prepend) {
            this.link.update({
                text: apiData.text,
                dateStr,
                isSelf,
            });
        }
    }

    _scrollingIsBottom() {
        return this.childEls.messages.scrollHeight - this.childEls.messages.scrollTop - this.childEls.messages.clientHeight < 100;
    }

    _scrollToBottom() {
        this.childEls.messages.scrollTop = this.childEls.messages.scrollHeight;
    }

    _addDateSep(messageId, prepend, dateStr) {
        this.datesSeps[messageId] = new DateSep({
            parentEl: this.childEls.messages,
            prepend,
            data: {
                dateStr,
            }
        });
    }

    open() {
        super.open();
        this.link.el.classList.add("chat-link--active");

        if (!(this.fullyLoaded)) {
            this._loadFull();
        }
    }

    _loadFull() {
        let offsetFromEnd = Object.keys(this.messages).length;
        requestChatHistory({
            chatId: this.id, offsetFromEnd,
        }).then((apiData) => {
            this._fillChatHistory(apiData.messages);
            this._scrollToBottom();
            this.fullyLoaded = true;
        });
    }

    _fillChatHistory(messages) {
        for (let i in messages) {
            this.addMessage(messages[i], true);
        }
    }

    close() {
        super.close();
        this.link.el.classList.remove("chat-link--active");
    }

    updateTyping(apiData) {
        if (this.typingTimeoutId) {
            clearTimeout(this.typingTimeoutId);
        }

        this.childEls.typing.textContent = apiData.user.firstName + " печатает...";

        this.typingTimeoutId = setTimeout(() => {
            this.childEls.typing.textContent = "";
            this.typingTimeoutId = null;
        }, 1000);
    }

    updateName(isOnline) {
        let newName = this.name;
        if (isOnline) {
            newName += " (в сети)";
        } else {
            newName += " (не в сети)";
        }
        this.childEls.name.textContent = newName;
    }

}
