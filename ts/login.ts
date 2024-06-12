import { requestToLogin, requestToCheckEmailCode, requestToSendEmailCode } from "./common/http/functions.js";
import { redirectToMainPage } from "./common/redirects.js";
import { JWT } from "./common/localStorage.js";
import { setInputAsInvalidAndNotifyWithThrow, removeInvalidClassForAllInputs } from "./common/inputsHighlighting.js";

const emailInputEl: HTMLInputElement = <HTMLInputElement>document.getElementById("js-email");
const sendEmailCodeButtonEl: HTMLButtonElement = <HTMLButtonElement>document.getElementById("js-send-email-code");
const emailCodeInputEl: HTMLInputElement = <HTMLInputElement>document.getElementById("js-email-code");
const buttonEl: HTMLButtonElement = <HTMLButtonElement>document.getElementById("js-button");

sendEmailCodeButtonEl.onclick = async () => {
    await checkEmail();
    await requestToSendEmailCode({email: emailInputEl.value});
    removeInvalidClassForAllInputs();
}

buttonEl.onclick = async () => {
    removeInvalidClassForAllInputs();
    await checkEmail();
    await checkEmailCode();
    
    let data = await requestToLogin({
        email: emailInputEl.value,
        code: Number(emailCodeInputEl.value),
    });

    JWT.set(data.JWT);
    redirectToMainPage();
}

async function checkEmail(): Promise<void> {
    if (!emailInputEl.value.includes("@")) {
        setInputAsInvalidAndNotifyWithThrow(emailInputEl, "Введите почту!");
    }
}

async function checkEmailCode(): Promise<void> {
    if (!emailCodeInputEl.value) {
        setInputAsInvalidAndNotifyWithThrow(emailCodeInputEl, "Введите код!");
        return;
    }

    let flagData = await requestToCheckEmailCode({
        email: emailInputEl.value,
        code: Number(emailCodeInputEl.value),
    });
    if (!flagData.codeIsValid) {
        setInputAsInvalidAndNotifyWithThrow(emailCodeInputEl, "Код подтверждения неверный!");
    }
}
