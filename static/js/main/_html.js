import { newMessageSound } from "../_audio.js";
import { dateToTimeStr, dateToDateStr, normalizeDateTimezone }  from "../_datetime.js";
import { makeHyperlinks } from "../_strTools.js";
import { setInputAsInvalidAndMessageWithThrow, removeInvalidClassForAllInputs } from "../_common.js";
import { requestChatHistory, requestUserInfo } from "../_http.js";
import { websocket } from "./_websocket.js";

const closerEl = document.getElementById("js-closer");

const userIdEl = document.getElementById("js-user-id");
const userNameEl = document.getElementById("js-user-name");

const allChatsLinksEl = document.getElementById("js-all-chats-links");

const loadedChatsEl = document.getElementById("js-loaded-chats");

const searchInputEl = document.getElementById("js-search-input");
const searchButtonEl = document.getElementById("js-search-button");
searchButtonEl.onclick = () => {
    searchUserAndSwitchToChat();
}

const newChatEl = document.getElementById("js-new-chat");
const newChatBackLinkEl = document.getElementById("js-new-chat-back-link");
newChatBackLinkEl.onclick = () => {
    hideChat(null);
}
const newChatNameEl = document.getElementById("js-new-chat-name");
const newChatInputEl = document.getElementById("js-new-chat-input");
const newChatButtonEl = document.getElementById("js-new-chat-button");
newChatButtonEl.onclick = () => {
    sendMessageToWebSocketAndClearInput({
        type: "newChat",
        data: {
            text: newChatInputEl.value,
            usersIds: [user.id, newChatUserId],
        }
    }, newChatInputEl);
}

const chatLinkTempEl = document.getElementById("js-chat-link-temp");
const chatTempEl = document.getElementById("js-chat-temp");
const chatMessageTempEl = document.getElementById("js-chat-message-temp");
const chatDateSepTempEl = document.getElementById("js-chat-date-sep-temp");

export const newDataHandlers = {
    "newChat": (data) => {
        displayChat(data);
        if (!data.isGroup) {
            for (let index in data.users) {
                if (data.users[index].id == newChatUserId) {
                    switchToChat(loadedChats[data.id]);
                    break;
                }
            }
        }
    },
    "newChatMessage": displayChatMessage,
    "newChatMessageTyping": displayTypingHint,
}

const MAX_CHAT_LINK_TEXT_LENGTH = 20;

var loadedChats = {}
var newChatUserId = null;
var interlocutorsChatsIds = {}
var user = null;
var openedChatId = null;

export function displayUserInfo(user_) {
    user = user_;
    userIdEl.textContent = "ID: " + user.id;
    userNameEl.textContent = user.firstName;
}

export function displayUserChats(data) {
    // for correct order
    data.chats.reverse();
    for (let index in data.chats) {
        displayChat(data.chats[index]);
    }
}

export function displayChatHistory(chat) {
    for (let index in chat.messages) {
        displayChatMessage(chat.messages[index], true);
    }
}

export function displayChat(chat) {
    let interlocutor = null;
    for (let index in chat.users) {
        if (chat.users[index].id != user.id) {
            interlocutor = chat.users[index];
        }
    }
    let chatName = chat.name ? chat.name : interlocutor.firstName;
    if (interlocutor) {
        interlocutorsChatsIds[interlocutor.id] = chat.id;
    }

    let chatNode = chatTempEl.content.cloneNode(true);
    loadedChatsEl.append(chatNode);
    let chatEl = loadedChatsEl.lastElementChild;

    let chatNameEl = chatEl.querySelector(".chat__name");
    chatNameEl.textContent = chatName;

    let chatBackLinkEl = chatEl.querySelector(".chat__back-link");
    chatBackLinkEl.onclick = function() {
        hideChat(loadedChats[chat.id]);
    }

    let chatMessagesEl = chatEl.querySelector(".chat__messages");

    let chatInputEl = chatEl.querySelector("textarea");
    chatInputEl.addEventListener("input", () => {
        websocket.sendJSON({
            type: "newChatMessageTyping",
            data: {
                chatId: chat.id,
            }
        });
    });

    let chatButtonEl = chatEl.querySelector("button");
    chatButtonEl.onclick = () => {
        if (!chatInputEl.value) {
            return;
        }
        sendMessageToWebSocketAndClearInput({
            type: "newChatMessage",
            data: {
                chatId: chat.id,
                text: chatInputEl.value,
            }
        }, chatInputEl);
    }

    let typingEl = chatEl.querySelector(".chat__interlocutor-write-hint");

    let chatLinkNode = chatLinkTempEl.content.cloneNode(true);
    allChatsLinksEl.append(chatLinkNode);
    let chatLinkEl = allChatsLinksEl.lastElementChild;
    chatLinkEl.onclick = async function() {
        await switchToChat(loadedChats[chat.id]);
    }

    let chatLinkNameEl = chatLinkEl.querySelector(".chat-link__chat-name");
    chatLinkNameEl.textContent = chatName

    let chatLinkLastMessageEl = chatLinkEl.querySelector(".chat-link__last-message");
    let chatLinkLastMessageDateEl = chatLinkEl.querySelector(".chat-link__date"); 

    loadedChats[chat.id] = {
        id: chat.id,
        fullyLoaded: false,
        messages: {},
        topMessage: null,
        bottomMessage: null,
        chatEl,
        chatNameEl,
        chatBackLinkEl,
        chatMessagesEl,
        chatInputEl,
        chatButtonEl,
        typingEl,
        chatLinkEl,
        chatLinkNameEl,
        chatLinkLastMessageEl,
        chatLinkLastMessageDateEl,
    }

    if (chat.lastMessage) {
        displayChatMessage(chat.lastMessage);
    }
}

// При `prepend` равном `true` (это используется исключительно в `displayChatHistory(...)`)
// сообщение добавляется в начало контейнера.
// При `false` - в конец контейнера. В этом случае сообщение расценивается как новое
// и обновляется также и боковая панель.
export function displayChatMessage(chatMessage, prepend=false) {
    let chat = loadedChats[chatMessage.chatId];

    chatMessage.creatingDatetime = new Date(chatMessage.creatingDatetime);
    normalizeDateTimezone(chatMessage.creatingDatetime);

    let timeStr = dateToTimeStr(chatMessage.creatingDatetime);
    let dateStr = dateToDateStr(chatMessage.creatingDatetime);
    let messagesEl = chat.chatMessagesEl;

    // Определяем флаг, обозначающий прокрутили ли мы весь чат в низ или нет. Флаг необходим для продолжения прокрутки
    // при новом сообщении. Эта проверка обязана быть перед созданием элемента-сообщения!
    let scrollingIsBottom = false;
    if (messagesEl.scrollHeight - messagesEl.scrollTop - messagesEl.clientHeight < 100) {
        scrollingIsBottom = true;
    }

    // Формируем разделительный элемент между днями, если это требуется:
    // (это действие необходимо делать перед формированием `message`)
    if (prepend && chat.bottomMessage) {
        if (chat.bottomMessage.dateStr != dateStr) {
            let chatDateSepNode = chatDateSepTempEl.content.cloneNode(true);
            messagesEl.prepend(chatDateSepNode);
            messagesEl.firstElementChild.textContent = chat.bottomMessage.dateStr;
        }
    } else if (!prepend && chat.topMessage) {
        if (chat.topMessage.dateStr != dateStr) {
            let chatDateSepNode = chatDateSepTempEl.content.cloneNode(true);
            messagesEl.append(chatDateSepNode);
            messagesEl.lastElementChild.textContent = dateStr;
        }
    } 

    let chatMessageNode = chatMessageTempEl.content.cloneNode(true);
    let chatMessageEl;
    if (prepend) {
        // Если сообщение получено из истории, то добавляем его в начало контейнера. 
        messagesEl.prepend(chatMessageNode);
        chatMessageEl = messagesEl.firstElementChild;
    } else {
        // Иначе - сообщение получено по веб-сокету - добавляем его в конец.
        messagesEl.append(chatMessageNode);
        chatMessageEl = messagesEl.lastElementChild;
    }

    let nameEl = chatMessageEl.querySelector(".chat__message__name");
    if (chatMessage.user.id != user.id) {
        nameEl.textContent = chatMessage.user.firstName;
    }
    let textEl = chatMessageEl.querySelector(".chat__message__text");
    textEl.textContent = chatMessage.text;
    // Данный трюк с `textContent` и `innerHTML` проворачивается,
    // чтобы из сообщения не могли быть распарсены никакие теги, введенные пользователем.
    textEl.innerHTML = makeHyperlinks(textEl.innerHTML);

    let timeEl = chatMessageEl.querySelector(".chat__message__time");
    timeEl.textContent = timeStr;

    let message = {
        chatMessageEl, 
        nameEl, 
        textEl, 
        timeEl, 
        obj: chatMessage,
        timeStr,
        dateStr,
    }
    chat.messages[chatMessage.id] = message;

    // Записываем крайнее сообщение для последующих разделителей дней:
    // (это действие необходимо делать формирования `message`)
    if (!chat.topMessage && !chat.bottomMessage) {
        // Если сообщение первое, то обозначим его, как крайнее и сверху и снизу.
        chat.topMessage = message;
        chat.bottomMessage = message;
    } else if (prepend) {
        chat.bottomMessage = message;
    } else {
        chat.topMessage = message;
    }

    if (!prepend) {
        let text = chatMessage.text;
        if (text.length > MAX_CHAT_LINK_TEXT_LENGTH) {
            text = text.slice(0, MAX_CHAT_LINK_TEXT_LENGTH) + "...";
        }
        chat.chatLinkLastMessageEl.textContent = text;
        chat.chatLinkLastMessageDateEl.textContent = dateStr;
        allChatsLinksEl.prepend(chat.chatLinkEl);
    }

    if (chatMessage.user.id == user.id) {
        chatMessageEl.classList.add("chat__message--self");
    } else {
        newMessageSound.play();
    }

    // Если в начале выполнения функции наш чат был прокручен к низу, то продолжаем его прокручивать.
    if (scrollingIsBottom) {
        messagesEl.scrollTop = messagesEl.scrollHeight;
    }

}

export function displayTypingHint(data) {
    let chat = loadedChats[data.chatId];
    if (chat.timeoutId) {
        clearTimeout(chat.timeoutId);
    }
    chat.typingEl.textContent = data.user.firstName + " печатает...";
    chat.timeoutId = setTimeout(() => {
        chat.typingEl.textContent = "";
        chat.timeoutId = null;
    }, 1000);
}

export function sendMessageToWebSocketAndClearInput(data, inputEl) {
    websocket.sendJSON(data);
    inputEl.value = "";
    inputEl.style.height = "50px";
}

async function switchToChat(chat) {
    hideChat(loadedChats[openedChatId]);
    openedChatId = chat.id;

    chat.chatEl.classList.remove("chat--hidden");
    chat.chatLinkEl.classList.add("chat-link--active");
    closerEl.style = "display: none;";

    if (!(chat.fullyLoaded)) {
        chat.fullyLoaded = true;
        let offsetFromEnd = Object.keys(chat.messages).length;
        displayChatHistory(await requestChatHistory({chatId: chat.id, offsetFromEnd}));
        chat.chatMessagesEl.scrollTop = chat.chatMessagesEl.scrollHeight;
    }
}

function hideChat(chat, showCloser=true) {
    if (chat != null) {
        chat.chatEl.classList.add("chat--hidden");
        chat.chatLinkEl.classList.remove("chat-link--active");
    }
    if (newChatUserId) {
        newChatUserId = null;
        newChatEl.classList.add("chat--hidden");
    }
    if (showCloser) {
        closerEl.style = "";
    }
}

async function searchUserAndSwitchToChat() {
    removeInvalidClassForAllInputs();
    let userId = Number(searchInputEl.value);
    if (!userId) {
        setInputAsInvalidAndMessageWithThrow(searchInputEl, "Введите нормальное число...")
    }
    let maybeChatId = interlocutorsChatsIds[userId];
    if (maybeChatId) {
        switchToChat(loadedChats[maybeChatId]);
        return;
    }
    if (userId == user.id) {
        setInputAsInvalidAndMessageWithThrow(searchInputEl, "Нельзя найти себя самого!")
    }

    let interlocutor = await requestUserInfo({id: userId});
    hideChat(loadedChats[openedChatId], false);
    newChatUserId = interlocutor.id;

    newChatNameEl.textContent = interlocutor.firstName;
    newChatEl.classList.remove("chat--hidden");
    closerEl.style = "display: none;";
}
