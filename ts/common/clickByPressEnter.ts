var pressedKeys: Set<string> = new Set();

document.addEventListener("keydown", (event: KeyboardEvent) => {
    pressedKeys.add(event.key);
});

document.addEventListener("keyup", (event: KeyboardEvent) => {
    pressedKeys.delete(event.key);
});

document.addEventListener("keydown", (event: KeyboardEvent) => {
    if (enterPressedAndShiftNotPressedAndEventTargetTagIsTextareaOrInputWithJsClass(event)) {
        event.preventDefault();
    }
});

document.addEventListener("keyup", (event: KeyboardEvent) => {
    if (!enterPressedAndShiftNotPressedAndEventTargetTagIsTextareaOrInputWithJsClass(event)) {
        return;
    }

    // @ts-ignore
    event.target.parentElement.querySelector(".js-click-by-press-enter-button").click();
});

function enterPressedAndShiftNotPressedAndEventTargetTagIsTextareaOrInputWithJsClass(event: KeyboardEvent): boolean {
    if (!event.target) {
        return false;
    }

    if (event.key != "Enter" || pressedKeys.has("Shift")) {
        return false;
    }

    // @ts-ignore
    if (!["textarea", "input"].includes(event.target.tagName.toLowerCase())) {
        return false;
    }

    // @ts-ignore
    if (!event.target.classList.contains("js-click-by-press-enter-input")) {
        return false;
    }

    return true;
}
