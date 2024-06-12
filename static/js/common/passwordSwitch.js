document.querySelectorAll("div.js-password-switch").forEach((container) => {
    var inputsEls = [...container.querySelectorAll("input.js-password-switch-input")];
    container.querySelectorAll("button.js-password-switch-hidden").forEach((button) => {
        button.onclick = () => {
            for (let i in inputsEls) {
                inputsEls[i].type = "text";
            }
        };
    });
    container.querySelectorAll("button.js-password-switch-showed").forEach((button) => {
        button.onclick = () => {
            for (let i in inputsEls) {
                inputsEls[i].type = "password";
            }
        };
    });
});
