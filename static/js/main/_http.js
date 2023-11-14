import { HTTP_USER_INFO_URL, HTTP_USER_CHATS_URL, HTTP_CHAT_HISTORY_URL} from "../_config.js";
import { BASE_AUTH_HEADERS } from "./_auth_cookie.js";

// FixMe: Возможно, стоит вынести функцию в независимый модуль.
export function redirectToLoginPage() {
    window.location.href = '/login';
}

// Запрашивает у сервера информацию о пользователе.
// Ожидаемое возвращаемое значение - `Object` формата {id, username, firstName, lastName, email}.
export async function requestUserInfo() {
    let response = await fetch(HTTP_USER_INFO_URL, {
        method: "GET",
        headers: BASE_AUTH_HEADERS,
    });
    if (response.ok) {
        return await response.json();
    } else if (response.status == 401) {
        redirectToLoginPage();
    } else {
        loadUserInfo();
    }
}

// Запрашивает у сервера все чаты, в которых состоит пользователь.
// Ожидаемое возвращаемое значение - `Object` формата:
// {chats: [{id, chatName, lastChatMessage: {id, userId, chatId, username, firstName, lastName, text, creatingDatetime}}, ...]}.
export async function requestUserChats() {
    let response = await fetch(HTTP_USER_CHATS_URL, {
        method: "GET",
        headers: BASE_AUTH_HEADERS,
    });
    if (response.ok) {
        return await response.json();
    } else if (response.status == 401) {
        redirectToLoginPage();
    } else {
        loadUserChats();
    }
}

// Запрашивает у сервера историю конкретного чата (пользователь обязательно должен в нём состоять!).
// Поскольку часть сообщений может быть уже загружена по веб-сокету, то был определён параметр `skipFromEndCount`.
// Ожидаемое возвращаемое значение - `Object` формата:
// {messages: [{id, userId, chatId, username, firstName, lastName, text, creatingDatetime}, ...]}.
export async function requestChatHistory(chatId, skipFromEndCount=null) {
    let queryParamsStr = "?" + new URLSearchParams({
        chatId, skipFromEndCount
    }).toString();
    let response = await fetch(HTTP_CHAT_HISTORY_URL + queryParamsStr, {
        method: "GET",
        headers: BASE_AUTH_HEADERS,
    });
    if (response.ok) {
        return await response.json();
    } else if (response.status == 401) {
        redirectToLoginPage();
    } else {
        loadChatHistory();
    }
}
