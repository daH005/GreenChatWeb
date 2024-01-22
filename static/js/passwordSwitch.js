document.querySelectorAll("div.js-password-switch").forEach((container) => {
    let inputEl = container.querySelector("input.js-password-switch-input");
    container.querySelector("button.js-password-switch-hidden").onclick = () => {
        inputEl.type = "text";
    }
    container.querySelector("button.js-password-switch-showed").onclick = () => {
        inputEl.type = "password";
    }
});
