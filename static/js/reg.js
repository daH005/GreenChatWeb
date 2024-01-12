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
backButtons.forEach((el) => {
    el.onclick = () => {
        curStep -= 1;
        setCarouselStep(curStep);
    }
});

const nextButtons = document.querySelectorAll(".js-next");
nextButtons.forEach((el) => {
    el.onclick = async () => {
        if (curStep == 0) {
            if (!firstNameInputEl.value) {
                alert("Введите имя!");
                return;
            }
            if (!lastNameInputEl.value) {
                alert("Введите фамилию!");
                return;
            }
        } else if (curStep == 1) {
            if (!usernameInputEl.value) {
                alert("Введите логин!");
                return;
            } else {
                let flagData = await requestCheckUsername(usernameInputEl.value);
                if (flagData.isAlreadyTaken) {
                    alert("Логин уже занят!");
                    return;
                }
            }
            if (!passwordInputEl.value) {
                alert("Введите пароль!");
                return;
            }
            if (passwordInputEl.value != passwordConfirmInputEl.value) {
                alert("Пароли не совпадают!");
                return;
            }
        }
        curStep += 1;
        setCarouselStep(curStep);
    }
});

sendMailButtonEl.onclick = async () => {
    await checkEmail();
    requestSendEmailCode(emailInputEl.value);
}

createAccountButtonEl.onclick = async () => {
    checkEmail();
    let flagData = await requestCheckEmailCode(mailCodeEl.value);
    if (!flagData.codeIsValid) {
        alert("Код подтверждения неверный!");
        return;
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
    if (!emailInputEl.value) {
        alert("Введите почту!");
        throw Error();  // FixMe: Подумать над лучшей реализацией. Однородной (выше return'ы).
    } else {
        let flagData = await requestCheckEmail(emailInputEl.value);
        if (flagData.isAlreadyTaken) {
            alert("Почта уже занята!");
            throw Error();  // FixMe: Подумать над лучшей реализацией. Однородной (выше return'ы).
        }
    }
}

function setCarouselStep(step) {
    console.log("Текущий шаг -", step);
    let transformValue = "translateY(-" + step * 100 + "%);";
    regCarouselEl.style = "transform: " + transformValue;
}
