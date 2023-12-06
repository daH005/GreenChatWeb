import { dateToTimeStr, dateToDateStr, normalizeDateTimezone }  from "../_datetime.js";
import { requestChatHistory, requestUserInfo } from "./_http.js";
import { websocket } from "./_websocket.js";

// Ключевые элементы страницы:
const closerEl = document.getElementById("js-closer");
const userInfoEl = document.getElementById("js-user-info");
const allChatsLinksEl = document.getElementById("js-all-chats-links");
const loadedChatsEl = document.getElementById("js-loaded-chats");
const textInputEl = document.getElementById("js-chat-message-text-input");
const buttonEl = document.getElementById("js-chat-message-button");
const inputContainerEl = document.getElementById("js-chat-message-input-container");
inputContainerEl.style = "display: none";
const searchInputEl = document.getElementById("js-search-input");
const searchButtonEl = document.getElementById("js-search-button");

// Отправка сообщения при нажатии Enter.
document.addEventListener("keypress", function(event) {
    if (event.keyCode == 13 && document.activeElement == textInputEl) {
        sendChatMessage();
    }
});

// Отправка сообщения при клике на кнопку.
buttonEl.onclick = () => {
    sendChatMessage();
}

// Поиск пользователя при нажатии Enter.
document.addEventListener("keypress", function(event) {
    if (event.keyCode == 13 && document.activeElement == searchInputEl) {
        searchUserAndSwitchToChat();
    }
});

// Отправка сообщения при клике на кнопку.
searchButtonEl.onclick = () => {
    searchUserAndSwitchToChat();
}

// Шаблон 'ссылки' на чат.
const chatLinkTempEl = document.getElementById("js-chat-link-temp");
// Шаблон чата.
const chatTempEl = document.getElementById("js-chat-temp");
// Шаблон сообщения.
const chatMessageTempEl = document.getElementById("js-chat-message-temp");

// Объект со всеми элементами и другими данными загруженных чатов.
var loadedChats = {}

var newChats = {}  // FixMe: Тест
var newChatIsOpened = false;
var newChatInterlocutor = null;

// Объект для сопоставления собеседников и ID чатов с ними.
var interlocutorsChatsIds = {}
// Данные пользователя. Подгружаются из `http.requestUserInfo()`.
var user = null;
// ID чата, открытого в данный момент времени.
var openedChatId = null;
// Дата и время самого позднего сообщения из всех чатов.
// Требуется для сортировки ссылок на чаты в боковой панели.
var commonLastMessageCreatingDatetime = 0;
// Максимальная длина текста сообщения в боковой панели.
const MAX_CHAT_LINK_TEXT_LENGTH = 20;

// Отображает на странице информацию об авторизированном пользователе.
export function displayUserInfo(user_) {
    user = user_;
    userInfoEl.textContent = user.firstName;
}

// Отображает на странице чаты (но они изначально скрыты) и 'ссылки' на эти чаты в боковой панели.
export function displayUserChats(data) {
    for (let index in data.chats) {
        displayChat(data.chats[index]);
    }
}

// Отображает все недостающие сообщения (историю) в чате.
export function displayChatHistory(chat) {
    // Переворачиваем массив для корректного отображения сообщений через `.prepend(...)`.
    chat.messages.reverse();
    for (let index in chat.messages) {
        displayChatMessage(chat.messages[index], true);
    }
}

// Отображает чат на странице (но изначально каждый чат всегда скрыт), а также 'ссылку' на него.
export function displayChat(chat) {
    // Создаём новое хранилище всех данных + элементов чата.
    loadedChats[chat.id] = {fullyLoaded: false, messages: {}}
    // Определяем название чата для текущего клиента.
    // Это может быть общее название беседы, либо имя собеседника.
    let chatName = chat.name ? chat.name : chat.interlocutor.firstName;
    // Записываем сопоставление для возможности поиска ID чата по ID пользователя.
    if (chat.interlocutor) {
        interlocutorsChatsIds[chat.interlocutor.id] = chat.id;
    }

    // Создаём 'ссылку' на чат в боковой панели.
    let chatLinkNode = chatLinkTempEl.content.cloneNode(true);
    allChatsLinksEl.append(chatLinkNode);
    let chatLinkEl = allChatsLinksEl.lastElementChild;
    chatLinkEl.onclick = async function() {
        await switchToChat(chat.id);
    }
    loadedChats[chat.id].chatLinkEl = chatLinkEl;

    // Название чата в 'ссылке'.
    let chatLinkNameEl = chatLinkEl.querySelector(".chat-link__chat-name");
    chatLinkNameEl.textContent = chatName
    loadedChats[chat.id].chatLinkNameEl = chatLinkNameEl;

    // Элемент последнего сообщения в 'ссылке'.
    // Содержимое сообщения устанавливается в `displayChatMessage`.
    let chatLinkLastMessageEl = chatLinkEl.querySelector(".chat-link__last-message");
    loadedChats[chat.id].chatLinkLastMessageEl = chatLinkLastMessageEl;

    // Элемент с временем последнего сообщения в 'ссылке'.
    // Время устанавливается в `displayChatMessage`.
    let chatLinkLastMessageDateEl = chatLinkEl.querySelector(".chat-link__date");
    loadedChats[chat.id].chatLinkLastMessageDateEl = chatLinkLastMessageDateEl;

    // Создаём сам чат.
    let chatNode = chatTempEl.content.cloneNode(true);
    loadedChatsEl.append(chatNode);
    let chatEl = loadedChatsEl.lastElementChild;
    loadedChats[chat.id].chatEl = chatEl;

    // Название чата.
    let chatNameEl = chatEl.querySelector(".chat__name");
    chatNameEl.textContent = chatName;
    loadedChats[chat.id].chatNameEl = chatNameEl;

    // Кнопка выхода из чата.
    let chatBackLinkEl = chatEl.querySelector(".chat__back-link");
    chatBackLinkEl.onclick = function() {
        hideChat(chat.id);
    }
    loadedChats[chat.id].chatBackLinkEl = chatBackLinkEl;

    // Контейнер с историей чата.
    let chatMessagesEl = chatEl.querySelector(".chat__messages");
    loadedChats[chat.id].chatMessagesEl = chatMessagesEl;

    if (chat.lastMessage) {
        displayChatMessage(chat.lastMessage);
    }
}

// Отображает сообщение в элементе чата.
// При `prepend` равном `true` (это используется исключительно в `displayChatHistory(...)`), 
// предполагается, что сообщение новое и в таком случае
// обновляется и содержимое 'ссылки' на чат, а также переход этой 'ссылки'
// на верхнюю позицию в случае если сообщение позднее `commonLastMessageCreatingDatetime`.
export function displayChatMessage(chatMessage, prepend=false) {
    // Создаём объект `Date`, а также устанавливаем часовой пояс клиента (от api даты всегда в UTC).
    chatMessage.creatingDatetime = new Date(chatMessage.creatingDatetime);
    normalizeDateTimezone(chatMessage.creatingDatetime);
    let timeStr = dateToTimeStr(chatMessage.creatingDatetime);
    let dateStr = dateToDateStr(chatMessage.creatingDatetime);

    // Работа с боковой панелью:
    if (!prepend) {
        // Обновляет текст, а также время отправки последнего сообщения в 'ссылке' на чат.
        let text = chatMessage.text;
        if (text.length > MAX_CHAT_LINK_TEXT_LENGTH) {
            text = text.slice(0, MAX_CHAT_LINK_TEXT_LENGTH) + "...";
        }
        loadedChats[chatMessage.chatId].chatLinkLastMessageEl.textContent = text;
        loadedChats[chatMessage.chatId].chatLinkLastMessageDateEl.textContent = dateStr;
    }
    // Если текущее обрабатываемое сообщение самое позднее, то переносим кнопку чата
    // на самый верх.
    if (chatMessage.creatingDatetime > commonLastMessageCreatingDatetime) {
        commonLastMessageCreatingDatetime = chatMessage.creatingDatetime;
        allChatsLinksEl.prepend(loadedChats[chatMessage.chatId].chatLinkEl);
    }

    // Непосредственно формируем элемент сообщения.
    let chatMessageNode = chatMessageTempEl.content.cloneNode(true);
    let chatMessageEl;
    if (prepend) {
        // Если сообщение получено из истории, то добавляем его в начало контейнера. 
        loadedChats[chatMessage.chatId].chatMessagesEl.prepend(chatMessageNode);
        chatMessageEl = loadedChats[chatMessage.chatId].chatMessagesEl.firstElementChild;
    } else {
        // Иначе - сообщение получено по веб-сокету - добавляем его в конец.
        loadedChats[chatMessage.chatId].chatMessagesEl.append(chatMessageNode);
        chatMessageEl = loadedChats[chatMessage.chatId].chatMessagesEl.lastElementChild;
    }

    // Имя отправителя сообщения.
    let nameEl = chatMessageEl.querySelector(".chat__message__name");
    if (chatMessage.user.id != user.id) {
        nameEl.textContent = chatMessage.user.firstName;
    }
    // Текст сообщения.
    let textEl = chatMessageEl.querySelector(".chat__message__text");
    textEl.textContent = chatMessage.text;

    // Время отправки сообщения.
    let timeEl = chatMessageEl.querySelector(".chat__message__time");
    timeEl.textContent = timeStr;

    // Фиксируем элементы и данные сообщения в хранилище.
    loadedChats[chatMessage.chatId].messages[chatMessage.id] = {
        chatMessageEl, nameEl, textEl, timeEl, chatMessage,
    }

    // Если сообщение от нас, то устанавливаем на элемент специальный CSS-класс,
    // а также выполняем прокрутку в самый низ чата.
    if (chatMessage.user.id == user.id) {
        chatMessageEl.classList.add("chat__message--self");
        loadedChats[chatMessage.chatId].chatMessagesEl.scrollTop = loadedChats[chatMessage.chatId].chatMessagesEl.scrollHeight;
    }
}

// Обрабатывает сообщение от веб-сокета.
export function handleWebSocketMessage(message) {
    if (message.chatIsNew) {
        displayChat(message);
        if ("newChat" + message.interlocutor.id == openedChatId) {
            switchToChat(message.id);
        }
    } else {
        displayChatMessage(message);
    }
}


// Отправляет рядовое сообщение на сервер в текущий открытый чат.
export function sendChatMessage() {
    if (textInputEl.value) {
        let data = {chatId: openedChatId, text: textInputEl.value}
        if (newChatIsOpened) {
            data.chatIsNew = true;
            data.usersIds = [user.id, newChatInterlocutor.id];
        }
        websocket.sendMessage(data);
        // Очищаем поле ввода, после отправки сообщения.
        textInputEl.value = "";
    }
}

// Скрывает открытый чат и открывает новый чат, соответствующий указанному `chatId`.
// Также убирает серую перегородку.
async function switchToChat(chatId) {
    hideChat(openedChatId);
    openedChatId = chatId;
    loadedChats[chatId].chatEl.classList.remove("chat--hidden");
    loadedChats[chatId].chatLinkEl.classList.add("chat-link--active");
    closerEl.style = "display: none;";
    inputContainerEl.style = "";
    // Загружаем историю чата с учётом сообщений, уже загруженных по веб-сокету.
    if (!(loadedChats[chatId].fullyLoaded)) {
        loadedChats[chatId].fullyLoaded = true;
        let offsetFromEnd = Object.keys(loadedChats[chatId].messages).length;
        displayChatHistory(await requestChatHistory(chatId, offsetFromEnd));
    }
}

// Скрывает чат с указанным `chatId` и ставит серую перегородку.
function hideChat(chatId) {
    if (chatId != null) {
        loadedChats[chatId].chatEl.classList.add("chat--hidden");
        if (loadedChats[chatId].chatLinkEl) {
            loadedChats[chatId].chatLinkEl.classList.remove("chat-link--active");
        }
    }
    newChatInterlocutor = null;
    newChatIsOpened = false;
    closerEl.style = "";
    inputContainerEl.style = "display: none";
}

// Отправляет HTTP-запрос на создание нового чата с пользователем, чей ID введён в поле (существование пользователя проверяется).
// Перед запросом проверяет наличие чата. Если он уже есть - тогда происходит переключение на него.
async function searchUserAndSwitchToChat() {
    let userId = searchInputEl.value;
    if (userId == user.id) {
        alert("Нельзя найти себя самого!");
        return;
    }
    let chatId = interlocutorsChatsIds[searchInputEl.value];
    if (chatId) {
        await switchToChat(chatId);
    } else {
        hideChat(openedChatId);
        let user = await requestUserInfo(userId);
        newChatInterlocutor = user;
        closerEl.style = "display: none;";
        inputContainerEl.style = "";
        newChatIsOpened = true;
        let chatId = "newChat" + user.id;
        openedChatId = chatId;
        if (!loadedChats[chatId]) {
            loadedChats[chatId] = {fullyLoaded: true, messages: {}}

            // Создаём сам чат.
            let chatNode = chatTempEl.content.cloneNode(true);
            loadedChatsEl.append(chatNode);
            let chatEl = loadedChatsEl.lastElementChild;
            loadedChats[chatId].chatEl = chatEl;

            // Название чата.
            let chatNameEl = chatEl.querySelector(".chat__name");
            chatNameEl.textContent = user.firstName;
            loadedChats[chatId].chatNameEl = chatNameEl;

            // Кнопка выхода из чата.
            let chatBackLinkEl = chatEl.querySelector(".chat__back-link");
            chatBackLinkEl.onclick = function() {
                hideChat(chatId);
            }
            loadedChats[chatId].chatBackLinkEl = chatBackLinkEl;
        }
        loadedChats[chatId].chatEl.classList.remove("chat--hidden");

    }
}
