import { saveJWTTokenAndRedirect } from "./_auth_tools.js";
import { requestRegistration,
         requestCheckUsername,
         requestCheckEmail,
         requestSendEmailCode,
         requestCheckEmailCode,
       } from "./_http.js";

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
    el.onclick = async () => {
        // Проверка введённых данных. В частности на непустоту.
        if (curStep == 0) {
            if (!firstNameInputEl.value) {
                alert("Введите имя!");
                return;
            }
            if (!lastNameInputEl.value) {
                alert("Введите фамилию!");
                return;
            }
        } else if (curStep == 1) {
            if (!usernameInputEl.value) {
                alert("Введите логин!");
                return;
            } else {
                // Проверяем занятость логина.
                let flagData = await requestCheckUsername(usernameInputEl.value);
                if (flagData.isAlreadyTaken) {
                    alert("Логин уже занят!");
                    return;
                }
            }
            if (!passwordInputEl.value) {
                alert("Введите пароль!");
                return;
            }
            if (passwordInputEl.value != passwordConfirmInputEl.value) {
                alert("Пароли не совпадают!");
                return;
            }
        }
        // После успешно пройденных проверок мы можем перейти на следующий шаг.
        curStep += 1;
        setCarouselStep(curStep);
    }
});

// Отправка письма с кодом на почту:
sendMailButtonEl.onclick = async () => {
    await checkEmail();
    requestSendEmailCode(emailInputEl.value);
    alert("Код успешно отправлен!");
}

// Отправляет регистрационные данные API и в случае получения токена, сохраняет его, после чего перенаправляет на главную.
createAccountButtonEl.onclick = async () => {
    checkEmail();
    // Все данные проверены. Пробуем отправить запрос на регистрацию.
    let data = await requestRegistration(
        firstNameInputEl.value,
        lastNameInputEl.value,
        usernameInputEl.value,
        passwordInputEl.value,
        emailInputEl.value,
    );
    // Вызывается исключение в случае плохого ответа, поэтому нулевой токен сохранён не будет.
    saveJWTTokenAndRedirect(data.JWTToken);
}

// Проверка почты на пустоту и занятость:
async function checkEmail() {
    if (!emailInputEl.value) {
        alert("Введите почту!");
        throw Error();  // FixMe: Подумать над лучшей реализацией. Однородной (выше return'ы).
    } else {
        let flagData = await requestCheckEmail(emailInputEl.value);
        if (flagData.isAlreadyTaken) {
            alert("Почта уже занята!");
            throw Error();  // FixMe: Подумать над лучшей реализацией. Однородной (выше return'ы).
        }
    }
}

// Прокручивает страницу на заданный шаг регистрации.
function setCarouselStep(step) {
    console.log("Текущий шаг -", step);
    let transformValue = "translateY(-" + step * 100 + "%);";
    regCarouselEl.style = "transform: " + transformValue;
}


