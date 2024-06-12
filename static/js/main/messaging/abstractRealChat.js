import { choose } from "../../common/random.js";
import { thisUser } from "../../common/thisUser.js";
import { userInWindow } from "../../common/userInWindowChecking.js";
import { newMessageSound } from "../../common/audio.js";
import { requestChatHistory } from "../../common/http/functions.js";
import { addUserToApiData } from "../../common/apiDataAdding.js";
import { sendWebSocketMessage } from "../websocket/init.js";
import { WebSocketMessageType } from "../websocket/messageTypes.js";
import { dateToDateStr, normalizeDateTimezone } from "../datetime.js";
import { HTMLDateSep } from "./dateSep.js";
import { HTMLChatMessage, HTMLChatMessageFromThisUser } from "./chatMessages.js";
import { sendMessageToWebSocketAndClearInput } from "./websocketFunctions.js";
import { AbstractHTMLChat } from "./abstractChat.js";
import { privateFakeChat } from "./privateFakeChat.js";
export class AbstractHTMLRealChat extends AbstractHTMLChat {
    static _curOpenedChat = null;
    _messagesEl;
    _typingEl;
    _messages;
    _fullyLoaded = false;
    _datesSeps = {};
    _link;
    _topDateStr = null;
    _bottomDateStr = null;
    _typingTimeoutId = null;
    _WAITING_FOR_CHAT_LOADING = 30;
    _PHRASES = [
        "Что же написать...",
        "Хм...",
        "Короче, да...",
        "В общем и целом...",
        "Ваше слово?",
        "Впиши в меня текст!",
        "Наполни меня текстом!",
    ];
    _id;
    _name;
    _lastMessage;
    _users;
    _unreadCount;
    constructor(id, name, lastMessage, users, unreadCount, interlocutor = null) {
        super(interlocutor);
        this._id = id;
        this._name = name;
        this._lastMessage = lastMessage;
        this._users = users;
        this._unreadCount = unreadCount;
        this._messages = {};
        this._datesSeps = {};
    }
    static get curOpenedChat() {
        return this._curOpenedChat;
    }
    get id() {
        return this._id;
    }
    _initChildEls() {
        super._initChildEls();
        this._nameEl.textContent = this._name;
        this._messagesEl = this._thisEl.querySelector(".chat__messages");
        this._messagesEl.addEventListener("scroll", () => {
            this._read();
        });
        this._textareaEl.addEventListener("input", () => {
            sendWebSocketMessage({
                type: WebSocketMessageType.NEW_CHAT_MESSAGE_TYPING,
                data: {
                    chatId: this.id,
                }
            });
        });
        this._textareaEl.setAttribute("placeholder", choose(this._PHRASES));
        this._buttonEl.onclick = () => {
            if (!this._messageTextIsMeaningful(this._textareaEl.value)) {
                return;
            }
            sendMessageToWebSocketAndClearInput({
                type: WebSocketMessageType.NEW_CHAT_MESSAGE,
                data: {
                    chatId: this.id,
                    text: this._textareaEl.value,
                }
            }, this._textareaEl);
        };
        this._typingEl = this._thisEl.querySelector(".chat__interlocutor-write-hint");
        if (this._lastMessage) {
            this.addMessage(this._lastMessage, false, true);
        }
    }
    async open() {
        privateFakeChat.close();
        if (AbstractHTMLRealChat._curOpenedChat) {
            AbstractHTMLRealChat._curOpenedChat.close();
        }
        AbstractHTMLRealChat._curOpenedChat = this;
        super.open();
        if (!(this._fullyLoaded)) {
            await this._loadFull();
        }
        this._link.open();
        this._read();
    }
    close() {
        super.close();
        this._link.close();
        AbstractHTMLRealChat._curOpenedChat = null;
    }
    addMessage(apiData, prepend = false, isFirst = false) {
        apiData.creatingDatetime = new Date(apiData.creatingDatetime);
        normalizeDateTimezone(apiData.creatingDatetime);
        let dateStr = dateToDateStr(apiData.creatingDatetime);
        if (!isFirst) {
            let dateStr_;
            if (prepend && this._bottomDateStr != dateStr) {
                dateStr_ = this._bottomDateStr;
            }
            else if (!prepend && this._topDateStr != dateStr) {
                dateStr_ = dateStr;
            }
            if (dateStr_) {
                this._addDateSep(apiData.id, prepend, dateStr_);
            }
        }
        let scrolledToBottomBackupBeforeMessageAdding = this._scrolledToBottom();
        let fromThisUser = thisUser.id == apiData.user.id;
        let messageType;
        if (!fromThisUser) {
            messageType = HTMLChatMessage;
        }
        else {
            messageType = HTMLChatMessageFromThisUser;
        }
        let message = new messageType(this._messagesEl, apiData.id, apiData.text, apiData.isRead, apiData.creatingDatetime, apiData.user, fromThisUser);
        message.init(prepend);
        this._messages[apiData.id] = message;
        if (scrolledToBottomBackupBeforeMessageAdding && !prepend) {
            this._scrollToBottom();
        }
        if (isFirst) {
            this._topDateStr = dateStr;
            this._bottomDateStr = dateStr;
        }
        else if (prepend) {
            this._bottomDateStr = dateStr;
        }
        else {
            this._topDateStr = dateStr;
        }
        let itIsNewInterlocutorMessage = !fromThisUser && !prepend && !isFirst;
        if (itIsNewInterlocutorMessage && (!userInWindow() || !this._isOpened)) {
            newMessageSound.play();
        }
        if (itIsNewInterlocutorMessage && userInWindow() && this._isOpened) {
            this._read();
        }
        if (!prepend) {
            this._link.updateLastMessageFromThisUserMark(fromThisUser);
            this._link.updateTextAndDate(apiData.text, dateStr);
        }
    }
    _scrolledToBottom() {
        return this._messagesEl.scrollHeight - this._messagesEl.scrollTop - this._messagesEl.clientHeight < 100;
    }
    _scrollToBottom() {
        this._messagesEl.scrollTop = this._messagesEl.scrollHeight;
    }
    _addDateSep(messageId, prepend, dateStr) {
        let dateSep = new HTMLDateSep(this._messagesEl, dateStr);
        dateSep.init(prepend);
        this._datesSeps[messageId] = dateSep;
    }
    async _loadFull() {
        let offsetFromEnd = Object.keys(this._messages).length;
        let apiData = await requestChatHistory({
            chatId: this.id, offsetFromEnd,
        });
        await this._fillChatHistory(apiData.messages);
        setTimeout(() => {
            this._scrollToLastReadOrMessageFromThisUser();
        }, this._WAITING_FOR_CHAT_LOADING);
        this._fullyLoaded = true;
    }
    async _fillChatHistory(messages) {
        for (let i in messages) {
            await addUserToApiData(messages[i]);
            this.addMessage(messages[i], true);
        }
    }
    _scrollToLastReadOrMessageFromThisUser() {
        this._messagesEl.scrollTop = this._scrollTopForLastReadOrMessageFromThisUserY();
    }
    _scrollTopForLastReadOrMessageFromThisUserY() {
        let message = this._lastReadOrMessageFromThisUser();
        if (!message) {
            return 0;
        }
        let scrollTop = this._messagesEl.scrollTop;
        let messageBottomAbsY = message.getBoundingClientRect().bottom + scrollTop;
        let messagesContainerBottomAbsY = this._messagesEl.getBoundingClientRect().bottom;
        let resultY = messageBottomAbsY - messagesContainerBottomAbsY;
        return resultY;
    }
    _lastReadOrMessageFromThisUser() {
        let message = null;
        let ids = this._sortedMessagesIds();
        for (let i in ids) {
            let id = ids[i];
            let curMessage = this._messages[id];
            if ((!curMessage.fromThisUser && curMessage.isRead) || curMessage.fromThisUser) {
                message = curMessage;
            }
            else if (!curMessage.fromThisUser && !curMessage.isRead) {
                break;
            }
        }
        return message;
    }
    _sortedMessagesIds() {
        let ids = Object.keys(this._messages).map(Number);
        ids.sort((a, b) => {
            return a - b;
        });
        return ids;
    }
    updateTyping(apiData) {
        if (this._typingTimeoutId) {
            clearTimeout(this._typingTimeoutId);
        }
        this._typingEl.textContent = apiData.user.firstName + " печатает...";
        this._typingTimeoutId = setTimeout(() => {
            this._typingEl.textContent = "";
            this._typingTimeoutId = null;
        }, 1000);
    }
    _read() {
        let message = this._lastVisibleMessage();
        if (!message.isRead && !message.fromThisUser) {
            message.setAsRead();
            sendWebSocketMessage({
                type: WebSocketMessageType.CHAT_MESSAGE_WAS_READ,
                data: {
                    chatId: this.id,
                    chatMessageId: message.id,
                }
            });
        }
    }
    _lastVisibleMessage() {
        let lineAbsY = this._messagesLineBottomAbsY();
        let ids = this._sortedMessagesIds();
        let message = null;
        for (let i in ids) {
            let id = ids[i];
            let messageBottomY = this._messages[id].getBoundingClientRect().bottom;
            if (messageBottomY <= lineAbsY) {
                message = this._messages[id];
            }
            else {
                break;
            }
        }
        return message;
    }
    _messagesLineBottomAbsY() {
        return this._messagesEl.getBoundingClientRect().bottom;
    }
    setMessagesAsRead(messagesIds) {
        for (let i in messagesIds) {
            let id = messagesIds[i];
            this._messages[id].setAsRead();
        }
    }
    updateOnlineStatus(isOnline) {
        super.updateOnlineStatus(isOnline);
        this._link.updateOnlineStatus(isOnline);
    }
    updateUnreadCount(count) {
        this._link.updateUnreadCount(count);
    }
}
