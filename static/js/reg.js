import { saveJWTTokenAndRedirect } from "./_authTools.js";
import { requestRegistration,
         requestCheckUsername,
         requestCheckEmail,
         requestSendEmailCode,
         requestCheckEmailCode,
       } from "./_http.js";

var curStep = 0;
const regCarouselEl = document.getElementById("js-reg-carousel");
const firstNameInputEl = document.getElementById("js-first-name");
const lastNameInputEl = document.getElementById("js-last-name");
const usernameInputEl = document.getElementById("js-username");
const passwordInputEl = document.getElementById("js-password");
const passwordConfirmInputEl = document.getElementById("js-password-confirm");
const emailInputEl = document.getElementById("js-email");
const sendMailButtonEl = document.getElementById("js-send-mail");
const mailCodeEl = document.getElementById("js-mail-code");
const createAccountButtonEl = document.getElementById("js-create-account");
const backButtons = document.querySelectorAll(".js-back");
const nextButtons = document.querySelectorAll(".js-next");

function setInputAsInvalidAndThrow(inputEl) {
    inputEl.classList.add("invalid");
    throw Error;
}

function removeInvalidClassForAllInputs() {
    document.querySelectorAll("input").forEach((el) => {
        el.classList.remove("invalid");
    });
}

function moveCarouselStep(dir=1) {
    setCarouselStep(curStep + dir);
}

function setCarouselStep(step) {
    curStep = step;
    console.log("Текущий шаг -", curStep);
    let transformValue = "translateY(-" + curStep * 100 + "%);";
    regCarouselEl.style = "transform: " + transformValue;
}

backButtons.forEach((el) => {
    el.onclick = () => {
        moveCarouselStep(-1);
    }
});

nextButtons[0].onclick = () => {
    removeInvalidClassForAllInputs();
    if (!firstNameInputEl.value) {
        setInputAsInvalidAndThrow(firstNameInputEl);
    }
    if (!lastNameInputEl.value) {
        setInputAsInvalidAndThrow(lastNameInputEl);
    }
    moveCarouselStep();
}

nextButtons[1].onclick = async () => {
    removeInvalidClassForAllInputs();
    if (usernameInputEl.value.length < 5) {
        alert("Длина логина не должна быть менее 5-ти символов!");
        setInputAsInvalidAndThrow(usernameInputEl);
    } else {
        let flagData = await requestCheckUsername({username: usernameInputEl.value});
        if (flagData.isAlreadyTaken) {
            alert("Логин уже занят!");
            setInputAsInvalidAndThrow(usernameInputEl);
        }
    }
    if (passwordInputEl.value.length < 10) {
        alert("Длина пароля не должна быть менее 10-ти символов!");
        setInputAsInvalidAndThrow(passwordInputEl);
    }
    if (passwordInputEl.value != passwordConfirmInputEl.value) {
        alert("Пароли не совпадают!");
        try {
            setInputAsInvalidAndThrow(passwordInputEl);
        } catch {
            setInputAsInvalidAndThrow(passwordConfirmInputEl);
        }
    }
    moveCarouselStep();
}

sendMailButtonEl.onclick = async () => {
    await checkEmail();
    await requestSendEmailCode({email: emailInputEl.value});
    removeInvalidClassForAllInputs();
}

createAccountButtonEl.onclick = async () => {
    await checkEmail();
    if (mailCodeEl.value.length < 4) {
        alert("Введите 4-х значный код!");
        setInputAsInvalidAndThrow(mailCodeEl);
    }
    let flagData = await requestCheckEmailCode({code: mailCodeEl.value});
    if (!flagData.codeIsValid) {
        alert("Код подтверждения неверный!");
        setInputAsInvalidAndThrow(mailCodeEl);
    }
    let data = await requestRegistration({
        firstName: firstNameInputEl.value,
        lastName: lastNameInputEl.value,
        username: usernameInputEl.value,
        password: passwordInputEl.value,
        email: emailInputEl.value,
        code: mailCodeEl.value,
    });
    saveJWTTokenAndRedirect(data.JWTToken);
}

async function checkEmail() {
    if (!emailInputEl.value.includes("@")) {
        alert("Введите почту!");
        setInputAsInvalidAndThrow(emailInputEl);
    } else {
        let flagData = await requestCheckEmail({email: emailInputEl.value});
        if (flagData.isAlreadyTaken) {
            alert("Почта уже занята!");
            setInputAsInvalidAndThrow(emailInputEl);
        }
    }
}
