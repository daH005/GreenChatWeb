import { requestToLogin,
         requestToCheckEmailCode,
         requestToSendEmailCode,
       } from "./common/http/functions.js";
import { redirectToMainPage } from "./common/redirects.js";
import { setInputAsInvalidAndNotifyWithThrow, removeInvalidClassForAllInputs } from "./common/inputsHighlighting.js";

const emailInputEl: HTMLInputElement = <HTMLInputElement>document.getElementById("js-email");
const sendEmailCodeButtonEl: HTMLButtonElement = <HTMLButtonElement>document.getElementById("js-send-email-code");
const emailCodeInputEl: HTMLInputElement = <HTMLInputElement>document.getElementById("js-email-code");
const buttonEl: HTMLButtonElement = <HTMLButtonElement>document.getElementById("js-button");

sendEmailCodeButtonEl.onclick = async () => {
    await checkEmail();
    await requestToSendEmailCode(emailInputEl.value);
    removeInvalidClassForAllInputs();
}

buttonEl.onclick = async () => {
    removeInvalidClassForAllInputs();
    await checkEmail();
    await checkEmailCode();
    
    await requestToLogin({
        email: emailInputEl.value,
        code: Number(emailCodeInputEl.value),
    });

    redirectToMainPage();
}

async function checkEmail() {
    if (!emailInputEl.value.includes("@")) {
        setInputAsInvalidAndNotifyWithThrow(emailInputEl, "Введите почту!");
    }
}

async function checkEmailCode() {
    if (!emailCodeInputEl.value) {
        setInputAsInvalidAndNotifyWithThrow(emailCodeInputEl, "Введите код!");
        return;
    }

    let codeIsValid = await requestToCheckEmailCode({
        email: emailInputEl.value,
        code: Number(emailCodeInputEl.value),
    });
    if (!codeIsValid) {
        setInputAsInvalidAndNotifyWithThrow(emailCodeInputEl, "Код подтверждения неверный!");
    }
}
