import { HTTP_USER_INFO_URL, HTTP_USER_CHATS_URL, HTTP_CHAT_HISTORY_URL, HTTP_REFRESH_TOKEN_URL } from "./_config.js";
import { redirectToLoginPage } from "./_redirects.js";
import { makeAuthHeaders } from "./_auth_tools.js";

// Запрашивает у сервера информацию о пользователе (текущем либо другом).
// При `id` = 1 выдаёт расширенную информацию о текущем пользователе.
// Иначе - урезанную информацию о пользователе с заданным ID.
// Ожидаемое возвращаемое значение - `Object` формата {id, username, firstName, lastName, email}.
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

// Запрашивает у сервера все чаты, в которых состоит пользователь.
// Ожидаемое возвращаемое значение - `Object` формата:
// {chats: [{id, chatName, lastChatMessage: {id, userId, chatId, username, firstName, lastName, text, creatingDatetime}}, ...]}.
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

// Запрашивает у сервера историю конкретного чата (пользователь обязательно должен в нём состоять!).
// Поскольку часть сообщений может быть уже загружена по веб-сокету, то был определён параметр `offsetFromEnd`.
// Ожидаемое возвращаемое значение - `Object` формата:
// {messages: [{id, userId, chatId, username, firstName, lastName, text, creatingDatetime}, ...]}.
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
// Ожидаемое возвращаемое значение - `Object` формата {JWTToken}.
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
