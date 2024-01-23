import { notify } from "./_notification.js";

export function setInputAsInvalidAndMessageWithThrow(inputEl, message=null) {
    if (message) {
        notify(message);
    }
    inputEl.classList.add("invalid");
    throw Error;
}

export function removeInvalidClassForAllInputs() {
    document.querySelectorAll("input").forEach((el) => {
        el.classList.remove("invalid");
    });
}
