const notificationEl = document.getElementById("notification");

export function notify(text) {
    notificationEl.textContent = text;
    setTimeout(() => {
        notificationEl.textContent = "";
    }, 5000)
}