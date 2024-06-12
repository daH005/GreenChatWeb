var notificationEl: HTMLElement | null = null;
var timeoutId: number | null = null;

export function notify(text: string): void {
    if (!notificationEl) {
        notificationEl = document.getElementById("notification");
    }

    notificationEl.textContent = text;

    if (timeoutId) {
        clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
        notificationEl.textContent = "";
    }, 5000)
}
