import { requestAuthByUsernameAndPassword } from "./_http.js";
import { saveJWTTokenAndRedirect } from "./_auth_tools.js";

// Ключевые элементы страницы:
const usernameInputEl = document.getElementById("js-username");
const passwordInputEl = document.getElementById("js-password");
const buttonEl = document.getElementById("js-button");

buttonEl.onclick = async () => {
    let username = usernameInputEl.value;
    let password = passwordInputEl.value;
    // Запрашиваем авторизацию. После получения токена сохраняем его и перенаправляемся на главную.
    if (username && password) {
        let data = await requestAuthByUsernameAndPassword(username, password);
        // Вызывается исключение в случае плохого ответа, поэтому нулевой токен сохранён не будет.
        saveJWTTokenAndRedirect(data.JWTToken);
    } else {
        alert("Логин или пароль пусты!...");
    }
}
