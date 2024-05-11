import { requestLogin, requestCheckEmailCode, requestSendEmailCode } from "./_http.js";
import { saveJWTAndRedirect } from "./_authorizationTools.js";
import { setInputAsInvalidAndMessageWithThrow, removeInvalidClassForAllInputs } from "./_common.js";

const emailInputEl = document.getElementById("js-email");
const sendEmailCodeButtonEl = document.getElementById("js-send-email-code");
const emailCodeInputEl = document.getElementById("js-email-code");
const buttonEl = document.getElementById("js-button");

sendEmailCodeButtonEl.onclick = async () => {
    await checkEmail();
    await requestSendEmailCode({email: emailInputEl.value});
    removeInvalidClassForAllInputs();
}

buttonEl.onclick = async () => {
    removeInvalidClassForAllInputs();
    await checkEmail();
    await checkEmailCode();
    
    let data = await requestLogin({
        email: emailInputEl.value,
        code: emailCodeInputEl.value,
    });
    saveJWTAndRedirect(data.JWT);
}

async function checkEmail() {
    if (!emailInputEl.value.includes("@")) {
        setInputAsInvalidAndMessageWithThrow(emailInputEl, "Введите почту!");
    }
}

async function checkEmailCode() {
    if (!emailCodeInputEl.value) {
        setInputAsInvalidAndMessageWithThrow(emailCodeInputEl, "Введите код!");
        return;
    }

    let flagData = await requestCheckEmailCode({
        email: emailInputEl.value,
        code: emailCodeInputEl.value,
    });
    if (!flagData.codeIsValid) {
        setInputAsInvalidAndMessageWithThrow(emailCodeInputEl, "Код подтверждения неверный!");
    }
}
