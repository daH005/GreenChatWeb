// Работа с Http + WebSocket.

// Возвращает куки с указанным `name`,
// или undefined, если ничего не найдено.
function getCookie(name) {
  let matches = document.cookie.match(new RegExp(
    "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
  ));
  return matches ? decodeURIComponent(matches[1]) : undefined;
}

const AUTH_TOKEN = getCookie(authTokenCookieKey);

fetch(HTTP_ALL_CHATS_URL + "?" + new URLSearchParams({[authTokenCookieKey]: AUTH_TOKEN})).then((response) => {
    response.json().then((data) => {
        for (let index in data.chats) {
            addChat(data.chats[index]);
        }
    });
});

const socket = new WebSocket(SOCKET_URL);

socket.onopen = (event) => {
    // Отправляем авторизующее сообщение.
    socket.send(JSON.stringify({
        [authTokenCookieKey]: AUTH_TOKEN,
    }));
}

socket.onmessage = (event) => {
    // Обрабатываем рядовое сообщение, полученное от сервера.
    let chatMessage = JSON.parse(event.data);
    addChatMessage(chatMessage);
}

// Работа с HTML:

const textInputEl = document.getElementById("js-chat-message-text-input");
const buttonEl = document.getElementById("js-chat-message-button");
const loadedChatsEl = document.getElementById("js-loaded-chats");
const allChatsLinksEl = document.getElementById("js-all-chats-links");

const chatMessageTempEl = document.getElementById("js-chat-message-temp");
const chatTempEl = document.getElementById("js-chat-temp");
const chatLinkTempEl = document.getElementById("js-chat-link-temp");
var chatsElementsObj = {}

function addChat(chat) {
    chatsElementsObj[chat.chatId] = {fullyLoaded: false, messagesElsObj: {}, lastMessageCreatingTime: 0}
    // Создаём ссылку на чат в боковой панели.
    let chatLinkNode = chatLinkTempEl.content.cloneNode(true);
    allChatsLinksEl.append(chatLinkNode);
    let chatLinkEl = allChatsLinksEl.lastElementChild;
    chatLinkEl.onclick = () => {
        if (chatId != null) {
            chatsElementsObj[chatId].chatEl.classList.add("chat--hidden");
        }
        chatsElementsObj[chat.chatId].chatEl.classList.remove("chat--hidden");
        chatId = chat.chatId;
        if (!(chatsElementsObj[chatId].fullyLoaded)) {
            chatsElementsObj[chatId].fullyLoaded = true;
            let skipFromEndCount = Object.keys(chatsElementsObj[chatId].messagesElsObj).length;
            fetch(HTTP_CHAT_HISTORY_URL + "?" + new URLSearchParams({[authTokenCookieKey]: AUTH_TOKEN, chatId, skipFromEndCount})).then((response) => {
                response.json().then((data) => {
                    data.messages.reverse();
                    for (let index in data.messages) {
                        addChatMessage(data.messages[index], true);
                    }
                });
            });
        }
    }
    chatsElementsObj[chat.chatId].chatLinkEl = chatLinkEl;

    // Название чата в ссылке.
    let chatLinkNameEl = chatLinkEl.querySelector(".chat-link__chat-name");
    chatLinkNameEl.textContent = chat.chatName;
    chatsElementsObj[chat.chatId].chatLinkNameEl = chatLinkNameEl;

    // Последнее сообщение в ссылке.
    let chatLinkLastMessageEl = chatLinkEl.querySelector(".chat-link__last-message");
    // chatLinkLastMessageEl.textContent = chat.lastChatMessage;
    chatsElementsObj[chat.chatId].chatLinkLastMessageEl = chatLinkLastMessageEl;

    // Создаём сам чат.
    let chatNode = chatTempEl.content.cloneNode(true);
    loadedChatsEl.append(chatNode);
    let chatEl = loadedChatsEl.lastElementChild;
    chatsElementsObj[chat.chatId].chatEl = chatEl;

    // Название чата.
    let chatNameEl = chatEl.querySelector(".chat__name");
    chatNameEl.textContent = chat.chatName;
    chatsElementsObj[chat.chatId].chatNameEl = chatNameEl;

    // Все сообщения чата.
    let chatMessagesEl = chatEl.querySelector(".chat__messages");
    chatsElementsObj[chat.chatId].chatMessagesEl = chatMessagesEl;

    addChatMessage(chat.lastChatMessage);
}

function addChatMessage(chatMessage, prepend=false) {
    let creatingTime = new Date(chatMessage.creatingDatetime).getTime();
    if (creatingTime > chatsElementsObj[chatMessage.chatId].lastMessageCreatingTime) {
        chatsElementsObj[chatMessage.chatId].lastMessageCreatingTime = creatingTime;
        chatsElementsObj[chatMessage.chatId].chatLinkLastMessageEl.textContent = chatMessage.text;
        allChatsLinksEl.prepend(chatsElementsObj[chatMessage.chatId].chatLinkEl);
    }

    let chatMessageNode = chatMessageTempEl.content.cloneNode(true);
    // chatMessageNode.id = creatingTime;
    let chatMessageEl;
    if (prepend) {
        chatsElementsObj[chatMessage.chatId].chatMessagesEl.prepend(chatMessageNode);
        chatMessageEl = chatsElementsObj[chatMessage.chatId].chatMessagesEl.firstElementChild;
    } else {
        chatsElementsObj[chatMessage.chatId].chatMessagesEl.append(chatMessageNode);
        chatMessageEl = chatsElementsObj[chatMessage.chatId].chatMessagesEl.lastElementChild;
    }

    let nameEl = chatMessageEl.querySelector(".chat__message__name");
    if (chatMessage.userId != userId) {
        nameEl.textContent = chatMessage.firstName;
    }
    let textEl = chatMessageEl.querySelector(".chat__message__text");
    textEl.textContent = chatMessage.text;

    chatsElementsObj[chatMessage.chatId].messagesElsObj[creatingTime] = {
        chatMessageEl, nameEl, textEl,
    }

    // Если сообщение от нас, то устанавливаем на элемент специальный CSS-класс,
    // а также выполняем прокрутку в самый низ чата.
    if (chatMessage.userId == userId) {
        chatMessageEl.classList.add("chat__message--self");
        // chatMessagesEl.scrollTop = chatMessagesEl.scrollHeight;
    }
}


// Отправляет рядовое сообщение на сервер в заданный чат с ID `chatId`.
function sendChatMessage() {
    // Пустое сообщение отправлять не будем.
    if (textInputEl.value && chatId) {
        // Отправляем рядовое сообщение в заданный чат.
        socket.send(JSON.stringify({
            chatId,
            text: textInputEl.value,
        }));
        // Очищаем поле ввода, после отправки сообщения.
        textInputEl.value = "";
    }
}

// Отправка сообщение при нажатии Enter.
document.addEventListener("keypress", function(event) {
    if (event.keyCode == 13) {
        sendChatMessage();
    }
});

// Отправка сообщения при клике на кнопку.
buttonEl.onclick = () => {
    sendChatMessage();
}
