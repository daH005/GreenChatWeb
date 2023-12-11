import { saveJWTTokenAndRedirect } from "./_auth_tools.js";
import { requestRegistration } from "./_http.js";

// Текущий этап регистрации.
var curStep = 0;

// Ключевые элементы страницы:
const regCarouselEl = document.getElementById("js-reg-carousel");
// Основные элементы с данными для регистрации:
const firstNameInputEl = document.getElementById("js-first-name");
const lastNameInputEl = document.getElementById("js-last-name");
const usernameInputEl = document.getElementById("js-username");
const passwordInputEl = document.getElementById("js-password");
const passwordConfirmInputEl = document.getElementById("js-password-confirm");
const emailInputEl = document.getElementById("js-email");
// Элементы для подтверждения почты.
const sendMailButtonEl = document.getElementById("js-send-mail");
const mailCodeEl = document.getElementById("js-mail-code");
// Создание аккаунта.
const createAccountButtonEl = document.getElementById("js-create-account");

// Возвращение на предыдущие шаги:
const backButtons = document.querySelectorAll(".js-back");
backButtons.forEach((el) => {
    el.onclick = () => {
        curStep -= 1;
        setCarouselStep(curStep);
    }
});

// Переход на следующие шаги:
const nextButtons = document.querySelectorAll(".js-next");
nextButtons.forEach((el) => {
    el.onclick = () => {
        curStep += 1;
        setCarouselStep(curStep);
    }
});

// Отправляет регистрационные данные API и в случае получения токена, сохраняет его, после чего перенаправляет на главную.
createAccountButtonEl.onclick = async () => {
    let firstName = firstNameInputEl.value;
    let lastName = lastNameInputEl.value;
    let username = usernameInputEl.value;
    let password = passwordInputEl.value;
    let email = emailInputEl.value;
    let data = await requestRegistration(firstName, lastName, username, password, email);
    // Вызывается исключение в случае плохого ответа, поэтому нулевой токен сохранён не будет.
    saveJWTTokenAndRedirect(data.JWTToken);
}

// Прокручивает страницу на заданный шаг регистрации.
function setCarouselStep(step) {
    console.log("Текущий шаг -", step);
    let transformValue = "translateY(-" + step * 100 + "%);";
    regCarouselEl.style = "transform: " + transformValue;
}


