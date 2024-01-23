const notificationEl = document.getElementById("notification");

function notify(text) {
    notificationEl.textContent = text;
    setTimeout(() => {
        notificationEl.textContent = "";
    }, 5000)
}