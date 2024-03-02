import { choose } from "../../_random.js";
import { requestChatHistory } from "../../_http.js";
import { dateToDateStr, normalizeDateTimezone }  from "../../_datetime.js";
import { newMessageSound } from "../../_audio.js";
import { userInWindow } from "../../_userInWindowChecking.js";
import { user } from "../_user.js";
import { addUserToApiData } from "../_apiDataAdding.js";
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
];

export class Chat extends AbstractChat {

    _init() {
        super._init();
        this.messages = [];
        this.fullyLoaded = false;
        this.datesSeps = {};

        this.id = this.data.fromApi.id;
        this.unreadCount = this.data.fromApi.unreadCount;

        this.name = null;
        this.interlocutorUser = null;
        this.link = null;
        this.topDateStr = null;
        this.bottomDateStr = null;
        this.typingTimeoutId = null;

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
        this.childEls.name.textContent = this.name;

        this.childEls.onlineStatus = this.el.querySelector(".chat__interlocutor-online-status");
        this.updateOnlineStatus(false);

        this.childEls.backLink = this.el.querySelector(".chat__back-link");
        this.childEls.backLink.onclick = () => {
            this.close();
        }

        this.childEls.messages = this.el.querySelector(".chat__messages");
        this.childEls.messages.addEventListener("scroll", () => {
            this._read();
        });

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
        this.link.updateUnreadCount(this.unreadCount);

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
                AbstractChat.interlocutorsChats[this.interlocutorUser.id] = this;
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

        let message = new ChatMessage({
            parentEl: this.childEls.messages,
            prepend,
            data: {
                fromApi: apiData,
            },
        });
        this.messages[apiData.id] = message;

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

        if (!isFirst && !prepend && !message.isSelf && (!userInWindow() || !this.isOpened)) {
            newMessageSound.play();
        }

        if (!prepend) {
            this.link.update({
                text: apiData.text,
                dateStr,
                isSelf: message.isSelf,
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

    async open() {
        if (!(this.fullyLoaded)) {
            await this._loadFull();
        }

        super.open();
        this.link.el.classList.add("chat-link--active");

        this._read();
    }

    async _loadFull() {
        let offsetFromEnd = Object.keys(this.messages).length;
        let apiData = await requestChatHistory({
            chatId: this.id, offsetFromEnd,
        });

        await this._fillChatHistory(apiData.messages);
        this._scrollToLastReadMessage();
        this.fullyLoaded = true;
    }

    async _fillChatHistory(messages) {
        for (let i in messages) {
            await addUserToApiData(messages[i]);
            this.addMessage(messages[i], true);
        }
    }

    _scrollToLastReadMessage() {
        this.childEls.messages.scrollTop = this._lastReadMessageY() - this.childEls.messages.clientHeight;
    }

    _lastReadMessageY() {
        let y = 0;

        let ids = this._sortedMessagesIds();
        for (let i in ids) {
            let id = ids[i];

            let curMessage = this.messages[id];
            if ((!curMessage.isSelf && curMessage.isRead) || curMessage.isSelf) {
                y = curMessage.el.getBoundingClientRect().bottom;
            } else if (!curMessage.isSelf && !curMessage.isRead) {
                break;
            }
        }
        return y;
    }

    _sortedMessagesIds() {
        let ids = Object.keys(this.messages);
        ids.sort();
        return ids;
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

    _read() {
        let message = this._lastVisibleMessage();
        if (!message.isRead && !message.isSelf) {
            message.isRead = true;
            websocket.sendJSON({
                type: "chatMessageWasRead",
                data: {
                    chatId: this.id,
                    chatMessageId: message.id,
                }
            });
        }
    }

    _lastVisibleMessage() {
        let scrollTop = this.childEls.messages.scrollTop;
        let h = this.childEls.messages.clientHeight;

        let ids = this._sortedMessagesIds();
        for (let i in ids) {
            let id = ids[i];

            let rect = this.messages[id].el.getBoundingClientRect();
            let y = rect.bottom + scrollTop;
            if (y >= scrollTop + h) {
                return this.messages[id];
            }
        }
    }

    setMessagesAsRead(messagesIds) {
        for (let i in messagesIds) {
            let id = messagesIds[i];
            this.messages[id].setAsRead();
        }
    }

}
