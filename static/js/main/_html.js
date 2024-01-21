import { dateToTimeStr, dateToDateStr, normalizeDateTimezone }  from "../_datetime.js";
import { makeHyperlinks } from "../_strTools.js";
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
document.addEventListener("keypress", function(event) {
    if (event.key == "Enter" && document.activeElement == searchInputEl) {
        searchUserAndSwitchToChat();
    }
});

const newChatEl = document.getElementById("js-new-chat");
const newChatBackLinkEl = document.getElementById("js-new-chat-back-link");
newChatBackLinkEl.onclick = () => {
    hideChat(null);
}
const newChatNameEl = document.getElementById("js-new-chat-name");
const newChatInputEl = document.getElementById("js-new-chat-input");
const newChatButtonEl = document.getElementById("js-new-chat-button");
newChatButtonEl.onclick = () => {
    sendMessageToWebSocket(newChatInputEl);
}

// Отслеживает зажатие клавиши Shift. Необходимо при отправке на Enter: если зажат Shift, то отправлять ни в коем случае не нужно,
// поскольку этими клавишами пользователь делает перенос.
var shiftIsDown = false;
document.addEventListener("keydown", (event) => {
    if (event.key == "Shift") {
        shiftIsDown = true;
    }
});
document.addEventListener("keyup", (event) => {
    if (event.key == "Shift") {
        shiftIsDown = false;
    }
});

// Отправка сообщения при нажатии Enter (Важно: отправки не будет, если зажат Shift!).
// Работает для всех textarea на странице, поскольку решено, что textarea - элемент чисто для ввода сообщений.
// FixMe: Я думаю стоит добавить CSS-класс.
document.addEventListener("keypress", (event) => {
    if (event.key == "Enter" && !shiftIsDown && document.activeElement.tagName == "TEXTAREA") {
	    sendMessageToWebSocket(document.activeElement);
        event.preventDefault();
    }
});

// Увеличивает высоту выбранного в данный момент textarea при добавлении переносов строк.
// Ограничивается стилем max-height.
document.addEventListener("keypress", (event) => {
    if (event.key == "Enter" && shiftIsDown && document.activeElement.tagName == "TEXTAREA") {
        document.activeElement.style.height = document.activeElement.scrollHeight + "px";
    }
});

// Шаблоны создаваемых элементов:
const chatLinkTempEl = document.getElementById("js-chat-link-temp");
const chatTempEl = document.getElementById("js-chat-temp");
const chatMessageTempEl = document.getElementById("js-chat-message-temp");
const chatDateSepTempEl = document.getElementById("js-chat-date-sep-temp");

// Объект, в котором ключи - ID чатов, а значения - вложенные объекты,
// хранящие html-элементы, а также другие важные данные по типу объектов сообщений.
var loadedChats = {}
var newChatUserId = null;
// Объект для сопоставления ID собеседников и ID чатов с ними.
// Необходим для поиска уже существующего чата по ID пользователя, введенного в `searchInputEl`.
var interlocutorsChatsIds = {}
var user = null;
var openedChatId = null;
const MAX_CHAT_LINK_TEXT_LENGTH = 20;

export function displayUserInfo(user_) {
    user = user_;
    userIdEl.textContent = "ID: " + user.id;
    userNameEl.textContent = user.firstName;
}

export function displayUserChats(data) {
    // Переворачиваем массив для добавления чатов в правильном порядке.
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
        hideChat(chat.id);
    }

    let chatMessagesEl = chatEl.querySelector(".chat__messages");

    let chatInputEl = chatEl.querySelector("textarea");

    // (Вопрос отправки сообщений на Enter решён в начале модуля).
    let chatButtonEl = chatEl.querySelector("button");
    chatButtonEl.onclick = () => {
        sendMessageToWebSocket(chatInputEl);
    }

    let chatLinkNode = chatLinkTempEl.content.cloneNode(true);
    allChatsLinksEl.append(chatLinkNode);
    let chatLinkEl = allChatsLinksEl.lastElementChild;
    chatLinkEl.onclick = async function() {
        await switchToChat(chat.id);
    }

    let chatLinkNameEl = chatLinkEl.querySelector(".chat-link__chat-name");
    chatLinkNameEl.textContent = chatName

    let chatLinkLastMessageEl = chatLinkEl.querySelector(".chat-link__last-message");

    let chatLinkLastMessageDateEl = chatLinkEl.querySelector(".chat-link__date"); 

    loadedChats[chat.id] = {
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
    chatMessage.creatingDatetime = new Date(chatMessage.creatingDatetime);
    normalizeDateTimezone(chatMessage.creatingDatetime);

    let timeStr = dateToTimeStr(chatMessage.creatingDatetime);
    let dateStr = dateToDateStr(chatMessage.creatingDatetime);
    let messagesEl = loadedChats[chatMessage.chatId].chatMessagesEl;

    // Определяем флаг, обозначающий прокрутили ли мы весь чат в низ или нет. Флаг необходим для продолжения прокрутки
    // при новом сообщении. Эта проверка обязана быть перед созданием элемента-сообщения!
    let scrollingIsBottom = false;
    if (messagesEl.scrollHeight - messagesEl.scrollTop - messagesEl.clientHeight < 100) {
        scrollingIsBottom = true;
    }

    // Формируем разделительный элемент между днями, если это требуется:
    // (это действие необходимо делать перед формированием `message`)
    if (prepend && loadedChats[chatMessage.chatId].bottomMessage) {
        if (loadedChats[chatMessage.chatId].bottomMessage.dateStr != dateStr) {
            let chatDateSepNode = chatDateSepTempEl.content.cloneNode(true);
            messagesEl.prepend(chatDateSepNode);
            messagesEl.firstElementChild.textContent = loadedChats[chatMessage.chatId].bottomMessage.dateStr;
        }
    } else if (!prepend && loadedChats[chatMessage.chatId].topMessage) {
        if (loadedChats[chatMessage.chatId].topMessage.dateStr != dateStr) {
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
    loadedChats[chatMessage.chatId].messages[chatMessage.id] = message;

    // Записываем крайнее сообщение для последующих разделителей дней:
    // (это действие необходимо делать формирования `message`)
    if (!loadedChats[chatMessage.chatId].topMessage && !loadedChats[chatMessage.chatId].bottomMessage) {
        // Если сообщение первое, то обозначим его, как крайнее и сверху и снизу.
        loadedChats[chatMessage.chatId].topMessage = message;
        loadedChats[chatMessage.chatId].bottomMessage = message;
    } else if (prepend) {
        loadedChats[chatMessage.chatId].bottomMessage = message;
    } else {
        loadedChats[chatMessage.chatId].topMessage = message;
    }

    if (!prepend) {
        let text = chatMessage.text;
        if (text.length > MAX_CHAT_LINK_TEXT_LENGTH) {
            text = text.slice(0, MAX_CHAT_LINK_TEXT_LENGTH) + "...";
        }
        loadedChats[chatMessage.chatId].chatLinkLastMessageEl.textContent = text;
        loadedChats[chatMessage.chatId].chatLinkLastMessageDateEl.textContent = dateStr;
        allChatsLinksEl.prepend(loadedChats[chatMessage.chatId].chatLinkEl);
    }

    if (chatMessage.user.id == user.id) {
        chatMessageEl.classList.add("chat__message--self");
    }

    // Если в начале выполнения функции наш чат был прокручен к низу, то продолжаем его прокручивать.
    if (scrollingIsBottom) {
        messagesEl.scrollTop = messagesEl.scrollHeight;
    }

}

export function handleWebSocketMessage(message) {
    if (message.type == "newChat") {
        displayChat(message.data);
        if (!message.data.isGroup) {
            for (let index in message.data.users) {
                if (message.data.users[index].id == newChatUserId) {
                    switchToChat(message.data.id);
                    break;
                }
            }
        }
    } else if (message.type == "newChatMessage") {
        displayChatMessage(message.data);
    }
}

export function sendMessageToWebSocket(inputEl) {
    let text = inputEl.value;
    if (text) {
        let message = {type: null, data: {text}}
        if (newChatUserId) {
            message.type = "newChat";
            message.data.usersIds = [user.id, newChatUserId];
        } else {
            message.type = "newChatMessage";
            message.data.chatId = openedChatId;
        }

        websocket.sendJSON(message);

        inputEl.value = "";
        inputEl.style.height = "50px";
    }
}

async function switchToChat(chatId) {
    hideChat(openedChatId);
    openedChatId = chatId;
    loadedChats[chatId].chatEl.classList.remove("chat--hidden");
    loadedChats[chatId].chatLinkEl.classList.add("chat-link--active");
    closerEl.style = "display: none;";

    if (!(loadedChats[chatId].fullyLoaded)) {
        loadedChats[chatId].fullyLoaded = true;
        let offsetFromEnd = Object.keys(loadedChats[chatId].messages).length;
        displayChatHistory(await requestChatHistory({chatId, offsetFromEnd}));
        loadedChats[chatId].chatMessagesEl.scrollTop = loadedChats[chatId].chatMessagesEl.scrollHeight;
    }
}

function hideChat(chatId, showCloser=true) {
    if (chatId != null) {
        loadedChats[chatId].chatEl.classList.add("chat--hidden");
        loadedChats[chatId].chatLinkEl.classList.remove("chat-link--active");
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
    let userId = Number(searchInputEl.value);
    if (!userId) {
        alert("Введите нормальное число...");
        return;
    }
    let maybeChatId = interlocutorsChatsIds[userId];
    if (maybeChatId) {
        switchToChat(maybeChatId);
        return;
    }
    if (userId == user.id) {
        alert("Нельзя найти себя самого!");
        return;
    }

    let interlocutor = await requestUserInfo(userId);
    hideChat(openedChatId, false);
    newChatUserId = interlocutor.id;

    newChatNameEl.textContent = interlocutor.firstName;
    newChatEl.classList.remove("chat--hidden");
    closerEl.style = "display: none;";
}
