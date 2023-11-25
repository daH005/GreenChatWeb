import { HTTP_AUTH_URL, JWT_TOKEN_LOCAL_STORAGE_KEY, BASE_HEADERS } from "./_config.js";
import { redirectToMainPage } from "./_redirects.js";
import { saveJWTToken } from "./_local_storage.js";

const usernameInputEl = document.getElementById("js-username-input");
const passwordInputEl = document.getElementById("js-password-input");
const buttonEl = document.getElementById("js-button");

buttonEl.onclick = () => {
    auth(usernameInputEl.value, passwordInputEl.value);
}

// Проводит попытку авторизовать пользователя.
// При статус-коде 200 фиксирует JWT-токен в `localStorage` и
// производит перенаправление на главную страницу мессенджера.
async function auth(username, password) {
    let response = await fetch(HTTP_AUTH_URL, {
        method: "POST",
        body: JSON.stringify({username, password}),
        headers: BASE_HEADERS,
    });
    if (response.ok) {
        let data = await response.json();
        // Сохраняем JWT-токен в `localStorage` и перенаправляемся на главную страницу мессенджера.
        saveJWTToken(data.JWTToken);
        redirectToMainPage();
    } else {
        alert("Неверный логин или пароль!");
    }
}
