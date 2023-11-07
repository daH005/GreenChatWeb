import { HTTP_AUTH_URL, AUTH_COOKIE_MAX_AGE, AUTH_TOKEN_COOKIE_KEY, BASE_HEADERS } from "./_config.js";
import { setCookie } from "./_cookie.js";

const usernameInputEl = document.getElementById("js-username-input");
const passwordInputEl = document.getElementById("js-password-input");
const buttonEl = document.getElementById("js-button");

buttonEl.onclick = () => {
    auth(usernameInputEl.value, passwordInputEl.value);
}

// Проводит попытку авторизовать пользователя.
// При статус-коде 200 фиксирует токен авторизации в cookie и
// производит редирект на главную страницу мессенджера.
async function auth(username, password) {
    let response = await fetch(HTTP_AUTH_URL, {
        method: "POST",
        body: JSON.stringify({username, password}),
        headers: BASE_HEADERS,
    });
    if (response.ok) {
        let data = await response.json();
        setCookie(AUTH_TOKEN_COOKIE_KEY, data.authToken, AUTH_COOKIE_MAX_AGE);
        window.location.href = '/';
    } else {
        alert("Неверный логин или пароль!");
    }
}
