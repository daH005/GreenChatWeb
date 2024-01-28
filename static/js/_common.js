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

export function setNegativeTabIndexForAllInputsAndButtons() {
    document.querySelectorAll("input, button").forEach((el) => {
        el.setAttribute("tabindex", "-1");
    });
}

export function delTabIndexForAllInputsAndButtonsInEl(container) {
    container.querySelectorAll("input, button").forEach((el) => {
        el.removeAttribute("tabindex");
    });
}
