import { dateToTimeStr, dateToDateStr, normalizeDateTimezone }  from "../_datetime.js";
import { requestChatHistory, requestUserInfo } from "../_http.js";
import { websocket } from "./_websocket.js";

// Ключевые элементы страницы:

// Холст, застилающий правую часть мессенджера. Необходим на случай, если чат не выбран.
const closerEl = document.getElementById("js-closer");

// ID пользователя.
const userIdEl = document.getElementById("js-user-id");
// Имя пользователя.
const userNameEl = document.getElementById("js-user-name");
// Элемент с ссылками на чаты.
const allChatsLinksEl = document.getElementById("js-all-chats-links");

// Элемент со всеми чатами, на которые заходил пользователь в данной сессии.
const loadedChatsEl = document.getElementById("js-loaded-chats");

// Поле ввода ID искомого пользователя.
const searchInputEl = document.getElementById("js-search-input");
// Кнопка для поиска пользователя по ID.
const searchButtonEl = document.getElementById("js-search-button");
searchButtonEl.onclick = () => {
    searchUserAndSwitchToChat();
}
// Поиск пользователя при нажатии Enter.
document.addEventListener("keypress", function(event) {
    if (event.key == "Enter" && document.activeElement == searchInputEl) {
        searchUserAndSwitchToChat();
    }
});

// Фейковый новый чат.
const newChatEl = document.getElementById("js-new-chat");
// Кнопка для выхода из фейкового чата.
const newChatBackLinkEl = document.getElementById("js-new-chat-back-link");
newChatBackLinkEl.onclick = () => {
    hideChat(null);
}
// Название фейкового чата.
const newChatNameEl = document.getElementById("js-new-chat-name");
// Поле ввода в фейковом чате.
const newChatInputEl = document.getElementById("js-new-chat-input");
// Кнопка для отправки первого сообщения в фейковом чате.
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

// Шаблон 'ссылки' на чат.
const chatLinkTempEl = document.getElementById("js-chat-link-temp");
// Шаблон чата.
const chatTempEl = document.getElementById("js-chat-temp");
// Шаблон сообщения.
const chatMessageTempEl = document.getElementById("js-chat-message-temp");
// Шаблон разделителя сообщений.
const chatDateSepTempEl = document.getElementById("js-chat-date-sep-temp");

// Объект, в котором ключи - ID чатов, а значения - вложенные объекты,
// хранящие html-элементы, а также другие важные данные по типу объектов сообщений.
var loadedChats = {}
// ID пользователя, с которым мы потенциально хотим начать новый чат.
// Необходим, поскольку при создании нового чата chatId нам неизвестен.
var newChatUserId = null;
// Объект для сопоставления ID собеседников и ID чатов с ними.
// Необходим для поиска уже существующего чата по ID пользователя, введенного в `searchInputEl`. 
var interlocutorsChatsIds = {}
// Данные пользователя. Представляет собой объект - {id, firstName, lastName, username, email}.
var user = null;
// ID чата, открытого в данный момент времени.
var openedChatId = null;
// Максимальная длина текста сообщения в боковой панели.
const MAX_CHAT_LINK_TEXT_LENGTH = 20;

// Отображает на странице информацию об авторизированном пользователе.
export function displayUserInfo(user_) {
    user = user_;
    userIdEl.textContent = "ID: " + user.id;
    userNameEl.textContent = user.firstName;
}

// Отображает на странице чаты (но они изначально скрыты) и 'ссылки' на эти чаты в боковой панели.
export function displayUserChats(data) {
    // Переворачиваем массив для добавления чатов в правильном порядке.
    data.chats.reverse();
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
    // Определяем название чата для текущего клиента.
    // Это может быть общее название беседы, либо имя собеседника.
    let chatName = chat.name ? chat.name : chat.interlocutor.firstName;
    // Записываем сопоставление для возможности поиска ID чата по ID пользователя.
    if (chat.interlocutor) {
        interlocutorsChatsIds[chat.interlocutor.id] = chat.id;
    }

    // Создаём корневой элемент чата.
    let chatNode = chatTempEl.content.cloneNode(true);
    loadedChatsEl.append(chatNode);
    let chatEl = loadedChatsEl.lastElementChild;

    // Название чата.
    let chatNameEl = chatEl.querySelector(".chat__name");
    chatNameEl.textContent = chatName;

    // Кнопка выхода из чата.
    let chatBackLinkEl = chatEl.querySelector(".chat__back-link");
    chatBackLinkEl.onclick = function() {
        hideChat(chat.id);
    }

    // Контейнер с историей чата.
    let chatMessagesEl = chatEl.querySelector(".chat__messages");

    // Поле ввода сообщения.
    let chatInputEl = chatEl.querySelector("textarea");

    // Кнопка для отправки сообщения.
    // (Вопрос отправки сообщений на Enter решён в начале модуля).
    let chatButtonEl = chatEl.querySelector("button");
    chatButtonEl.onclick = () => {
        sendMessageToWebSocket(chatInputEl);
    }

    // Создаём 'ссылку' на чат в боковой панели.
    let chatLinkNode = chatLinkTempEl.content.cloneNode(true);
    allChatsLinksEl.append(chatLinkNode);
    let chatLinkEl = allChatsLinksEl.lastElementChild;
    chatLinkEl.onclick = async function() {
        await switchToChat(chat.id);
    }

    // Название чата в 'ссылке'.
    let chatLinkNameEl = chatLinkEl.querySelector(".chat-link__chat-name");
    chatLinkNameEl.textContent = chatName

    // Элемент последнего сообщения в 'ссылке'.
    // Содержимое сообщения устанавливается в `displayChatMessage`.
    let chatLinkLastMessageEl = chatLinkEl.querySelector(".chat-link__last-message");

    // Элемент с временем последнего сообщения в 'ссылке'.
    // Время устанавливается в `displayChatMessage`.
    let chatLinkLastMessageDateEl = chatLinkEl.querySelector(".chat-link__date"); 

    // Создаём новое хранилище всех данных + элементов чата.
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

// Отображает сообщение в заданном чате.
// При `prepend` равном `true` (это используется исключительно в `displayChatHistory(...)`)
// сообщение добавляется в начало контейнера.
// При `false` - в конец контейнера. В этом случае сообщение расценивается как новое
// и обновляется также и боковая панель.
export function displayChatMessage(chatMessage, prepend=false) {
    // Создаём объект `Date`, а также устанавливаем часовой пояс клиента (API возвращает даты в UTC):
    chatMessage.creatingDatetime = new Date(chatMessage.creatingDatetime);
    normalizeDateTimezone(chatMessage.creatingDatetime);
    // Формируем строковые представления даты создания для боковой панели, разделительной черты и самого сообщения:
    let timeStr = dateToTimeStr(chatMessage.creatingDatetime);
    let dateStr = dateToDateStr(chatMessage.creatingDatetime);

    // Определяем флаг, обозначающий прокрутили ли мы весь чат в самый низ или нет. Флаг необходим для продолжения прокрутки
    // при новом сообщении. Эта проверка обязана быть перед созданием элемента-сообщения!
    let scrollingIsBottom = false;
    // Делаем более короткую ссылку на объект, который используется в этой функции чаще всего.
    let messagesEl = loadedChats[chatMessage.chatId].chatMessagesEl;
    if (messagesEl.scrollHeight - messagesEl.scrollTop - messagesEl.clientHeight < 1) {
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

    // Непосредственно формируем элемент сообщения.
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

    // Фиксируем элементы и данные сообщения в хранилище:
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

    // Если сообщение новое, то обновим боковую панель:
    if (!prepend) {
        // Обновляет текст, а также время отправки последнего сообщения в 'ссылке' на чат.
        let text = chatMessage.text;
        if (text.length > MAX_CHAT_LINK_TEXT_LENGTH) {
            text = text.slice(0, MAX_CHAT_LINK_TEXT_LENGTH) + "...";
        }
        loadedChats[chatMessage.chatId].chatLinkLastMessageEl.textContent = text;
        loadedChats[chatMessage.chatId].chatLinkLastMessageDateEl.textContent = dateStr;
        // Переносим ссылку на чат на самый верх боковой панели.
        allChatsLinksEl.prepend(loadedChats[chatMessage.chatId].chatLinkEl);
    }
 
    // Если сообщение от нас, то устанавливаем на элемент специальный CSS-класс.
    if (chatMessage.user.id == user.id) {
        chatMessageEl.classList.add("chat__message--self");
    }
    // Если в начале выполнения функции наш чат был прокручен к самому низу, то продолжаем его прокручивать.
    if (scrollingIsBottom) {
        messagesEl.scrollTop = messagesEl.scrollHeight;
    }

}

// Обрабатывает сообщение от веб-сокета.
export function handleWebSocketMessage(message) {
    // Если сообщение от веб-сокета представляет собой новый чат, то создаём его.
    if (message.type == "newChat") {
        displayChat(message.data);
        if (message.data.interlocutor.id == newChatUserId) {
            switchToChat(message.data.id);
        }
    // Или если - это обычное сообщение в уже существующий чат. Создаём его.
    } else if (message.type == "newChatMessage") {
        displayChatMessage(message.data);
    }
}

// Отправляет сообщение на сервер по веб-сокету.
export function sendMessageToWebSocket(inputEl) {
    let text = inputEl.value;
    if (text) {
        let message = {type: null, data: {text}}
        // Если в данный момент у нас открыт фейковый новый чат, то составим сообщение,
        // по которому веб-сокет создаст нам новый чат. Иначе - сообщения на создание нового обычного сообщения
        // в конкретный чат.
        if (newChatUserId) {
            message.type = "newChat";
            message.data.usersIds = [user.id, newChatUserId];
        } else {
            message.type = "newChatMessage";
            message.data.chatId = openedChatId;
        }
        websocket.sendMessage(message);
        // После отправки сообщения очищаем поле ввода и ставим его обычную высоту.
        inputEl.value = "";
        inputEl.style.height = "50px";
    }
}

// Скрывает открытый чат и открывает новый чат, соответствующий указанному `chatId`.
// Также убирает серую перегородку `closerEl`.
async function switchToChat(chatId) {
    hideChat(openedChatId);
    openedChatId = chatId;
    loadedChats[chatId].chatEl.classList.remove("chat--hidden");
    loadedChats[chatId].chatLinkEl.classList.add("chat-link--active");
    closerEl.style = "display: none;";
    // Загружаем историю чата с учётом сообщений, уже загруженных по веб-сокету.
    if (!(loadedChats[chatId].fullyLoaded)) {
        loadedChats[chatId].fullyLoaded = true;
        let offsetFromEnd = Object.keys(loadedChats[chatId].messages).length;
        displayChatHistory(await requestChatHistory(chatId, offsetFromEnd));
        loadedChats[chatId].chatMessagesEl.scrollTop = loadedChats[chatId].chatMessagesEl.scrollHeight;
    }
}

// Скрывает чат с указанным `chatId` и ставит серую перегородку `closerEl`.
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

// Отправляет HTTP-запрос на создание нового чата с пользователем, чей ID введён в поле (существование пользователя проверяется).
// Перед запросом проверяет наличие чата. Если он уже есть - тогда происходит переключение на него.
async function searchUserAndSwitchToChat() {
    let userId = Number(searchInputEl.value);
    if (!userId) {
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
    // Находим нашего потенциального собеседника.
    // Если пользователь не найден или ID некорректен, то на этом этапе возникает исключение (оно ничего не ломает).
    let interlocutor = await requestUserInfo(userId);
    // Скрываем текущий открытый чат.
    hideChat(openedChatId, false);
    // Устанавливаем `newChatUserId` для обозначения того, что мы сейчас находимся в фейковом чате.
    newChatUserId = interlocutor.id;
    // Устанавливаем название нового потенциального чата (т.е. имя собеседника).
    newChatNameEl.textContent = interlocutor.firstName;
    // Показываем фейковый чат.
    newChatEl.classList.remove("chat--hidden");
    // Убираем перегородку, а также показываем поле ввода сообщения + кнопку.
    closerEl.style = "display: none;";
}

