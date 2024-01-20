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
import { makeAuthHeaders } from "./_authTools.js";

// Returns - {JWTToken}.
export async function requestRegistration(data) {
    let response = await fetch(HTTP_REG_URL, {
        method: "POST",
        body: JSON.stringify(data),
        headers: BASE_HEADERS,
    });
    if (response.ok) {
        return await response.json();
    } else {
        alert("Ошибка регистрации... " + response.status);
        throw Error();
    }
}

// Returns - {isAlreadyTaken}.
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

// Returns - {isAlreadyTaken}.
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

// Returns - {status}.
export async function requestSendEmailCode(email) {
    let response = await fetch(HTTP_SEND_EMAIL_CODE_URL, {
        method: "POST",
        body: JSON.stringify({email}),
        headers: BASE_HEADERS,
    });
    if (response.ok) {
        alert("Код успешно отправлен!")
        return await response.json();
    } else if (response.status == 409) {
        alert("Вы не можете отправлять более одного кода в минуту!")
        throw Error();
    } else {
        alert("Некорректная почта!")
        throw Error();
    }
}

// Returns - {codeIsValid}.
export async function requestCheckEmailCode(code) {
    let queryParamsStr = "?" + new URLSearchParams({
        code
    }).toString();
    let response = await fetch(HTTP_CHECK_EMAIL_CODE_URL + queryParamsStr, {
        method: "GET",
        headers: BASE_HEADERS,
    });
    if (response.ok) {
        return await response.json();
    } else {
        throw Error();
    }
}

// Returns - {JWTToken}.
export async function requestAuthByUsernameAndPassword(data) {
    let response = await fetch(HTTP_AUTH_URL, {
        method: "POST",
        body: JSON.stringify(data),
        headers: BASE_HEADERS,
    });
    if (response.ok) {
        return await response.json();
    } else {
        alert("Неверный логин или пароль!");
        throw Error();
    }
}

// Returns - {id, firstName, lastName, ?username, ?email}.
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
        alert("Пользователь с таким ID не найден!");
        throw Error();
    }
}

// Returns - {chats: [{id, name, isGroup, lastMessage, users}, ...]}.
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

// Returns - {messages: [{id, chatId, text, creatingDatetime, user}, ...]}.
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

// Returns - {JWTToken}.
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
