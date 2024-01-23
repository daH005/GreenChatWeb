var pressedKeys = new Set();
document.addEventListener("keydown", (event) => {
    pressedKeys.add(event.key);
});
document.addEventListener("keyup", (event) => {
    pressedKeys.delete(event.key);
});

document.addEventListener("keydown", (event) => {
    handleEnterPressAndCallFunc();
});

document.addEventListener("keyup", (event) => {
    handleEnterPressAndCallFunc((buttonEl) => {
        buttonEl.click();
    });
});

function handleEnterPressAndCallFunc(func=null) {
    document.querySelectorAll(".js-click-by-press-enter").forEach((container) => {
        let inputEl = container.querySelector(".js-click-by-press-enter-input");
        let buttonEl = container.querySelector(".js-click-by-press-enter-button");
        if (event.key == "Enter" && !pressedKeys.has("Shift") && document.activeElement == inputEl) {
            if (func) {
                func(buttonEl);
            }
            event.preventDefault();
        }
    });
}
