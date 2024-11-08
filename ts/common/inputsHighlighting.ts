import { notify } from "./notification.js";

export function setInputAsInvalidAndNotifyWithThrow(inputEl: HTMLInputElement, message: string=null): void {
    if (message) {
        notify(message);
    }
    inputEl.classList.add("invalid");
    throw Error(message);
}

export function removeInvalidClassForAllInputs(): void {
    document.querySelectorAll("input").forEach((el) => {
        el.classList.remove("invalid");
    });
}
