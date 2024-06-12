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
