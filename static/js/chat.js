// Работа с Http + WebSocket.

fetch(HTTP_CHAT_HISTORY_URL + "?" + new URLSearchParams({email, password, chatId})).then((response) => {
    response.json().then((chat) => {
        for (let index in chat.messages) {
            addChatMessageEl(chat.messages[index]);
        }
    });
});

let socket = new WebSocket(SOCKET_URL);

socket.onopen = (event) => {
    // Отправляем авторизующее сообщение.
    socket.send(JSON.stringify({
        email, password,
    }));
}

socket.onmessage = (event) => {
    // Обрабатываем рядовое сообщение, полученное от сервера.
    let chatMessage = JSON.parse(event.data);
    addChatMessageEl(chatMessage);
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
        nameEl.textContent = chatMessage.firstName + " " + chatMessage.lastName;
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
