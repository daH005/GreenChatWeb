import { requestAuth, requestCheckEmailCode, requestSendEmailCode } from "./_http.js";
import { saveJWTTokenAndRedirect } from "./_authTools.js";
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
    
    let data = await requestAuth({
        email: emailInputEl.value,
        code: emailCodeInputEl.value,
    });
    saveJWTTokenAndRedirect(data.JWTToken);
}

async function checkEmail() {
    if (!emailInputEl.value.includes("@")) {
        setInputAsInvalidAndMessageWithThrow(emailInputEl, "Введите почту!");
    }
}

async function checkEmailCode() {
    let flagData = await requestCheckEmailCode({
        email: emailInputEl.value,
        code: emailCodeInputEl.value,
    });
    if (!flagData.codeIsValid) {
        setInputAsInvalidAndMessageWithThrow(emailCodeInputEl, "Код подтверждения неверный!");
    }
}
