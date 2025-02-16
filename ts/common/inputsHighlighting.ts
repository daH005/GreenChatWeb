import { notify } from "./notification.js";

export function setInputAsInvalidAndNotifyWithThrow(inputEl: HTMLInputElement, message: string=null): void {
    if (message) {
        notify(message);
    }
    _thisOrParentEl(inputEl).classList.add("invalid");
    throw Error(message);
}

export function removeInvalidClassForAllInputs(): void {
    document.querySelectorAll("input").forEach((el) => {
        _thisOrParentEl(el).classList.remove("invalid");
    });
}

function _thisOrParentEl(el: HTMLInputElement): HTMLInputElement | HTMLElement {
    if (el.hasAttribute("data-invalid-parent")) {
        return el.parentElement;
    }
    return el;
}
