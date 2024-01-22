import { requestAuthByUsernameAndPassword } from "./_http.js";
import { saveJWTTokenAndRedirect } from "./_authTools.js";

const usernameInputEl = document.getElementById("js-username");
const passwordInputEl = document.getElementById("js-password");
const buttonEl = document.getElementById("js-button");

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
