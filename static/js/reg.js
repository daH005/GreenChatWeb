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

const backButtons = document.querySelectorAll(".js-back");
const nextButtons = document.querySelectorAll(".js-next");
const createAccountButtonEl = document.getElementById("js-create-account");

backButtons.forEach((el) => {
    el.onclick = () => {
        moveCarouselStep(-1);
    }
});

sendMailButtonEl.onclick = async () => {
    await checkEmail();
    await requestSendEmailCode({email: emailInputEl.value});
    removeInvalidClassForAllInputs();
}

function setInputAsInvalidAndMessageWithThrow(inputEl, message=null) {
    if (message) {
        alert(message);
    }
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

nextButtons[0].onclick = () => {
    removeInvalidClassForAllInputs();
    if (!firstNameInputEl.value) {
        setInputAsInvalidAndMessageWithThrow(firstNameInputEl, "Введите ваше имя!");
    }
    if (!lastNameInputEl.value) {
        setInputAsInvalidAndMessageWithThrow(lastNameInputEl, "Введите вашу фамилию!");
    }
    moveCarouselStep();
}

nextButtons[1].onclick = async () => {
    removeInvalidClassForAllInputs();
    if (usernameInputEl.value.length < 5) {
        setInputAsInvalidAndMessageWithThrow(usernameInputEl, "Длина логина не должна быть менее 5-ти символов!");
    } else {
        let flagData = await requestCheckUsername({username: usernameInputEl.value});
        if (flagData.isAlreadyTaken) {
            setInputAsInvalidAndMessageWithThrow(usernameInputEl, "Логин уже занят!");
        }
    }
    if (passwordInputEl.value.length < 10) {
        setInputAsInvalidAndMessageWithThrow(passwordInputEl, "Длина пароля не должна быть менее 10-ти символов!");
    }
    if (passwordInputEl.value != passwordConfirmInputEl.value) {
        try {
            setInputAsInvalidAndMessageWithThrow(passwordInputEl, "Пароли не совпадают!");
        } catch {
            setInputAsInvalidAndMessageWithThrow(passwordConfirmInputEl);
        }
    }
    moveCarouselStep();
}

createAccountButtonEl.onclick = async () => {
    await checkEmail();
    if (mailCodeEl.value.length < 4) {
        setInputAsInvalidAndMessageWithThrow(mailCodeEl, "Введите 4-х значный код!");
    }
    let flagData = await requestCheckEmailCode({code: mailCodeEl.value});
    if (!flagData.codeIsValid) {
        setInputAsInvalidAndMessageWithThrow(mailCodeEl, "Код подтверждения неверный!");
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
        setInputAsInvalidAndMessageWithThrow(emailInputEl, "Введите почту!");
    } else {
        let flagData = await requestCheckEmail({email: emailInputEl.value});
        if (flagData.isAlreadyTaken) {
            setInputAsInvalidAndMessageWithThrow(emailInputEl, "Почта уже занята!");
        }
    }
}
