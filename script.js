// Работа с WebSocket:
const SOCKET_URL = "ws://localhost:80";
let socket = new WebSocket(SOCKET_URL);

socket.onmessage = (event) => {
  let messages = JSON.parse(event.data);
  for (let index in messages) {
    addMessageEl(messages[index])
  }
}

// Работа с HTML:
const nameInputEl = document.getElementById("js-message-name-input");
const colorInputEl = document.getElementById("js-message-color-input");
const textInputEl = document.getElementById("js-message-text-input");
const buttonEl = document.getElementById("js-message-button");
const messagesEl = document.getElementById("js-messages");
const messageTempEl = document.getElementById("js-message-temp");

buttonEl.onclick = () => {
    socket.send(JSON.stringify({
        name: nameInputEl.value,
        color: colorInputEl.value,
        text: textInputEl.value,
    }));
    textInputEl.value = "";
}

function addMessageEl(message) {
    let clonedMessageEl = messageTempEl.content.cloneNode(true);
    let nameEl = clonedMessageEl.querySelector(".message__name");
    nameEl.textContent = message.name + ":";
    nameEl.style = "color: " + (message.color || "gray") + ";";
    clonedMessageEl.querySelector(".message__text").textContent = message.text;
    messagesEl.append(clonedMessageEl);
}
