var notificationEl = null;
var timeoutId = null;
export function notify(text) {
    if (!notificationEl) {
        notificationEl = document.getElementById("notification");
    }
    notificationEl.textContent = text;
    if (timeoutId) {
        clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
        notificationEl.textContent = "";
    }, 5000);
}
