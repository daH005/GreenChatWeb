import { requestAuthByUsernameAndPassword } from "./_http.js";
import { saveJWTTokenAndRedirect } from "./_auth_tools.js";

const usernameInputEl = document.getElementById("js-username");
const passwordInputEl = document.getElementById("js-password");
const buttonEl = document.getElementById("js-button");
const passwordSwitchButtonEl = document.getElementById("js-password-switch");
const eyeEl = passwordSwitchButtonEl.querySelector("i");

buttonEl.onclick = async () => {
    let username = usernameInputEl.value;
    let password = passwordInputEl.value;
    if (username && password) {
        let data = await requestAuthByUsernameAndPassword({username, password});
        saveJWTTokenAndRedirect(data.JWTToken);
    } else {
        alert("Логин или пароль пусты!...");
    }
}

passwordSwitchButtonEl.onclick = () => {
    passwordInputEl.type = passwordInputEl.type == "password" ? "text" : "password";
    if (passwordInputEl.type == "password") {
        eyeEl.className = eyeEl.className.replace("fa-eye", "fa-eye-slash");
    } else {
        eyeEl.className = eyeEl.className.replace("fa-eye-slash", "fa-eye");
    }
}
