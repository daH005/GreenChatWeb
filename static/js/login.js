import { JWT_TOKEN_LOCAL_STORAGE_KEY } from "./_config.js";
import { redirectToMainPage } from "./_redirects.js";
import { saveJWTToken } from "./_local_storage.js";
import { requestAuthByUsernameAndPassword } from "./_http.js";

const usernameInputEl = document.getElementById("js-username");
const passwordInputEl = document.getElementById("js-password");
const buttonEl = document.getElementById("js-button");

buttonEl.onclick = async () => {
    let username = usernameInputEl.value;
    let password = passwordInputEl.value;
    // Запрашиваем авторизацию. После получения токена сохраняем его и перенаправляемся на главную.
    if (username && password) {
        let data = await requestAuthByUsernameAndPassword(username, password);
        saveJWTTokenAndRedirect(data.JWTToken);
    } else {
        alert("Логин или пароль пусты!...");
    }
}

// Сохраняет JWT-токен в `localStorage` и перенаправляет на главную.
export function saveJWTTokenAndRedirect(token) {
    saveJWTToken(token);
    redirectToMainPage();
}
