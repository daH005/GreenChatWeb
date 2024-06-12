export function setNegativeTabIndexForAllInputsAndButtons(): void {
    document.querySelectorAll("input, button").forEach((el: HTMLElement) => {
        el.setAttribute("tabindex", "-1");
    });
}

export function delTabIndexForAllInputsAndButtonsInEl(container: HTMLElement): void {
    container.querySelectorAll("input, button").forEach((el: HTMLElement) => {
        el.removeAttribute("tabindex");
    });
}
