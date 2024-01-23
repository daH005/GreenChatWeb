import { requestAuthByUsernameAndPassword } from "./_http.js";
import { saveJWTTokenAndRedirect } from "./_authTools.js";
import { setInputAsInvalidAndMessageWithThrow, removeInvalidClassForAllInputs } from "./_common.js";

const usernameInputEl = document.getElementById("js-username");
const passwordInputEl = document.getElementById("js-password");
const buttonEl = document.getElementById("js-button");

buttonEl.onclick = async () => {
    removeInvalidClassForAllInputs();
    let username = usernameInputEl.value;
    if (!username) {
        setInputAsInvalidAndMessageWithThrow(usernameInputEl, "Введите ваш логин!");
    }
    let password = passwordInputEl.value;
    if (!password) {
        setInputAsInvalidAndMessageWithThrow(passwordInputEl, "Введите ваш пароль (не украдём)!");
    }
    
    let data = await requestAuthByUsernameAndPassword({username, password});
    saveJWTTokenAndRedirect(data.JWTToken);
}
