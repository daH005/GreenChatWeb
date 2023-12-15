import { BASE_HEADERS,
         HTTP_REG_URL,
         HTTP_CHECK_USERNAME_URL,
         HTTP_CHECK_EMAIL_URL,
         HTTP_SEND_EMAIL_CODE_URL,
         HTTP_CHECK_EMAIL_CODE_URL,
         HTTP_AUTH_URL,
         HTTP_USER_INFO_URL,
         HTTP_USER_CHATS_URL,
         HTTP_CHAT_HISTORY_URL,
         HTTP_REFRESH_TOKEN_URL,
       } from "./_config.js";
import { redirectToLoginPage } from "./_redirects.js";
import { makeAuthHeaders } from "./_auth_tools.js";

// Отправляет запрос на регистрацию нового аккаунта. Возвращает объект {JWTToken}.
export async function requestRegistration(firstName, lastName, username, password, email, code) {
    let response = await fetch(HTTP_REG_URL, {
        method: "POST",
        body: JSON.stringify({firstName, lastName, username, password, email, code}),
        headers: BASE_HEADERS,
    });
    if (response.ok) {
        return await response.json();
    } else {
        alert("Ошибка регистрации... " + response.status);
        throw Error();
    }
}

// Отправляет запрос на проверку занятости логина. Возвращает объект {isAlreadyTaken}.
export async function requestCheckUsername(username) {
    let queryParamsStr = "?" + new URLSearchParams({
        username
    }).toString();
    let response = await fetch(HTTP_CHECK_USERNAME_URL + queryParamsStr, {
        method: "GET",
        headers: BASE_HEADERS,
    });
    if (response.ok) {
        return await response.json();
    } else {
        throw Error();
    }
}

// Отправляет запрос на проверку занятости почты. Возвращает объект {isAlreadyTaken}.
export async function requestCheckEmail(email) {
    let queryParamsStr = "?" + new URLSearchParams({
        email
    }).toString();
    let response = await fetch(HTTP_CHECK_EMAIL_URL + queryParamsStr, {
        method: "GET",
        headers: BASE_HEADERS,
    });
    if (response.ok) {
        return await response.json();
    } else {
        throw Error();
    }
}

// Отправляет запрос на отправку кода подтверждения почты. Возвращает объект {status}.
export async function requestSendEmailCode(email) {
    let response = await fetch(HTTP_SEND_EMAIL_CODE_URL, {
        method: "POST",
        body: JSON.stringify({email}),
        headers: BASE_HEADERS,
    });
    if (response.ok) {
        return await response.json();
    } else {
        throw Error();
    }
}

// FixMe: Функция не используется (как и сам ресурс).
// Отправляет запрос на проверку кода подтверждения почты. Возвращает объект {codeIsValid}.
export async function requestCheckEmailCode(code) {
    let response = await fetch(HTTP_CHECK_EMAIL_CODE_URL, {
        method: "POST",
        body: JSON.stringify({code}),
        headers: BASE_HEADERS,
    });
    if (response.ok) {
        return await response.json();
    } else {
        throw Error();
    }
}

// Отправляет запрос авторизации. Возвращает объект {JWTToken}.
export async function requestAuthByUsernameAndPassword(username, password) {
    let response = await fetch(HTTP_AUTH_URL, {
        method: "POST",
        body: JSON.stringify({username, password}),
        headers: BASE_HEADERS,
    });
    if (response.ok) {
        return await response.json();
    } else {
        alert("Неверный логин или пароль!");
        throw Error();
    }
}

// Запрашивает у сервера информацию о пользователе (о текущем по токену либо о другом по ID).
// При `id` = null выдаёт расширенную информацию о текущем пользователе.
// Иначе - урезанную информацию о пользователе с заданным ID.
// Ожидается объект {id, firstName, lastName, ?username, ?email}.
export async function requestUserInfo(id=null) {
    let url = HTTP_USER_INFO_URL;
    if (id) {
        url += "?" + new URLSearchParams({
            id
        }).toString();
    }
    let response = await fetch(url, {
        method: "GET",
        headers: makeAuthHeaders(),
    });
    if (response.ok) {
        return await response.json();
    } else if (response.status == 401) {
        redirectToLoginPage();
    } else {
        throw Error();
    }
}

// Запрашивает все чаты, в которых состоит текущий пользователь. Ожидается объект формата:
// {chats: [{id, ?name, ?interlocutor: {...}, lastMessage: {id, chatId, user: {...}, text, creatingDatetime}}, ...]}.
export async function requestUserChats() {
    let response = await fetch(HTTP_USER_CHATS_URL, {
        method: "GET",
        headers: makeAuthHeaders(),
    });
    if (response.ok) {
        return await response.json();
    } else if (response.status == 401) {
        redirectToLoginPage();
    } else {
        throw Error();
    }
}

// Запрашивает историю конкретного чата (пользователь обязательно должен в нём состоять!).
// Поскольку часть сообщений может быть уже загружена по веб-сокету, то был определён параметр `offsetFromEnd`.
// Ожидается объект формата:
// {messages: [{id, chatId, user: {...}, text, creatingDatetime}, ...]}.
export async function requestChatHistory(chatId, offsetFromEnd=null) {
    let queryParamsStr = "?" + new URLSearchParams({
        offsetFromEnd
    }).toString();
    let response = await fetch(HTTP_CHAT_HISTORY_URL.replace("{}", String(chatId)) + queryParamsStr, {
        method: "GET",
        headers: makeAuthHeaders(),
    });
    if (response.ok) {
        return await response.json();
    } else if (response.status == 401) {
        redirectToLoginPage();
    } else {
        throw Error();
    }
}

// Запрашивает у сервера новый JWT-токен для продления срока доступа.
// Ожидается объект {JWTToken}.
export async function requestNewJWTToken() {
    let response = await fetch(HTTP_REFRESH_TOKEN_URL, {
        method: "POST",
        headers: makeAuthHeaders(),
    });
    if (response.ok) {
        return await response.json();
    } else if (response.status == 401) {
        redirectToLoginPage();
    } else {
        throw Error();
    }
}
