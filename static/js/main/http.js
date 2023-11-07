import { HTTP_USER_INFO_URL, HTTP_USER_CHATS_URL, HTTP_CHAT_HISTORY_URL} from "../config.js";
import { BASE_AUTH_HEADERS } from "./config.js";

function redirectToLoginPage() {
    window.location.href = '/login';
}

export async function requestUserInfo() {
    let response = await fetch(HTTP_USER_INFO_URL, {
        method: "GET",
        headers: BASE_AUTH_HEADERS,
    });
    if (response.ok) {
        return await response.json();
    } else if (response.status == 403) {
        redirectToLoginPage();
    } else {
        loadUserInfo();
    }
}

export async function requestUserChats() {
    let response = await fetch(HTTP_USER_CHATS_URL, {
        method: "GET",
        headers: BASE_AUTH_HEADERS,
    });
    if (response.ok) {
        return await response.json();
    } else if (response.status == 403) {
        redirectToLoginPage();
    } else {
        loadUserChats();
    }
}

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
    } else if (response.status == 403) {
        redirectToLoginPage();
    } else {
        loadChatHistory();
    }
}
