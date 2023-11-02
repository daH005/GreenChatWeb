// Работа с Http + WebSocket.

// FixMe: Убрать, после перехода на Flask.
const urlParams = new URLSearchParams(window.location.search);
var userId = Number(urlParams.get("userId") || 0);
var chatId = Number(urlParams.get("chatId") || 0);

// FixMe: Сделать установку URL'ов через Flask.
const SOCKET_URL = "ws://localhost:80";
const HTTP_URL = "http://localhost:81/chat_history"

fetch(HTTP_URL + "?" + new URLSearchParams({userId, chatId})).then((response) => {
    response.json().then((chatMessages) => {
        for (let index in chatMessages) {
            addChatMessageEl(chatMessages[index]);
        }
    });
});

let socket = new WebSocket(SOCKET_URL);

socket.onopen = (event) => {
    // Отправляем авторизующее сообщение.
    socket.send(JSON.stringify({
        userId,
    }));
}

socket.onmessage = (event) => {
    // Обрабатываем рядовое сообщение, полученное от сервера.
    let chatMessages = JSON.parse(event.data);
    for (let index in chatMessages) {
        addChatMessageEl(chatMessages[index])
    }
}

// Работа с HTML:

const textInputEl = document.getElementById("js-chat-message-text-input");
const buttonEl = document.getElementById("js-chat-message-button");
const chatMessagesEl = document.getElementById("js-chat-messages");
const chatMessageTempEl = document.getElementById("js-chat-message-temp");

// Отправляет рядовое сообщение на сервер в заданный чат с ID `chatId`.
function sendChatMessage() {
    // Пустое сообщение отправлять не будем.
    if (textInputEl.value) {
        // Отправляем рядовое сообщение в заданный чат.
        socket.send(JSON.stringify({
            userId,
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

// Добавляет элемент-сообщение в конец чата.
function addChatMessageEl(chatMessage) {
    // Копируем шаблон сообщения.
    let clonedChatMessageNode = chatMessageTempEl.content.cloneNode(true);
    let nameEl = clonedChatMessageNode.querySelector(".chat__message__name");
    // Добавляем к сообщению имя, если оно не от нас.
    if (chatMessage.userId != userId) {
        nameEl.textContent = chatMessage.name;
    }
    // Добавляем к сообщению текст.
    clonedChatMessageNode.querySelector(".chat__message__text").textContent = chatMessage.text;
    // Добавляем элемент-сообщение в конец чата.
    chatMessagesEl.append(clonedChatMessageNode);
    // Если сообщение от нас, то устанавливаем на элемент специальный CSS-класс,
    // а также выполняем прокрутку в самый низ чата.
    if (chatMessage.userId == userId) {
        chatMessagesEl.lastElementChild.classList.add("chat__message--self");
        chatMessagesEl.scrollTop = chatMessagesEl.scrollHeight;
    }
}
