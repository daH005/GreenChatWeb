const notificationEl = document.getElementById("notification");

var timeoutId = null;

function notify(text) {
    notificationEl.textContent = text;

    if (timeoutId) {
        clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
        notificationEl.textContent = "";
    }, 5000)
}