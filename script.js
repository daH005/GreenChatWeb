// Работа с WebSocket.
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

function sendMessage() {
    if (textInputEl.value && nameInputEl.value) {
        socket.send(JSON.stringify({
            name: nameInputEl.value,
            // color: colorInputEl.value,
            text: textInputEl.value,
        }));
        textInputEl.value = "";
    }
}

document.addEventListener("keypress", function(event) {
    if (event.keyCode == 13) {
        sendMessage();
    }
});

buttonEl.onclick = () => {
    sendMessage();
}

function addMessageEl(message) {
    let clonedMessageNode = messageTempEl.content.cloneNode(true);
    let nameEl = clonedMessageNode.querySelector(".chat__message__name");
    if (message.name != nameInputEl.value) {
        nameEl.textContent = message.name;
        // nameEl.style = "background: " + (message.color || "gray") + ";";
    }
    clonedMessageNode.querySelector(".chat__message__text").textContent = message.text;
    messagesEl.append(clonedMessageNode);
    if (message.name == nameInputEl.value) {
        messagesEl.lastElementChild.classList.add("chat__message--self");
        messagesEl.scrollTop = messagesEl.scrollHeight;
    }
}
