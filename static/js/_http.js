import { BASE_HEADERS, HTTP_ENDPOINTS_URLS } from "./_config.js";
import { redirectToLoginPage } from "./_redirects.js";
import { makeAuthHeaders } from "./_authTools.js";
import { notify } from "./_notification.js";

export function makeRequestingFunc(options) {
    options = {
        STATUSES_NOTIFICATIONS: {},
        ERROR_FUNCS: {},
        ...options,
    }
    async function request(data) {
        let [fetchUrl, fetchOptions] = makeRequestingUrlAndOptions(options, data);

        let response = await fetch(fetchUrl, fetchOptions);
        if (response.status in options.STATUSES_NOTIFICATIONS) {
            notify(options.STATUSES_NOTIFICATIONS[response.status]);
        }

        if (response.ok) {
            return await response.json();
        } else if (response.status in options.ERROR_FUNCS) {
            return options.ERROR_FUNCS[response.status]();
        } else if (!(response.status in options.STATUSES_NOTIFICATIONS)){
            console.log("Неизвестная ошибка...", response.status);
        }
        throw Error;
    }
    request.options = options;  // save for tests!
    return request;
}

// required in `options` - {URL, METHOD}
export function makeRequestingUrlAndOptions(options, data=null) {
    let fetchUrl = options.URL;
    let fetchOptions = {
        method: options.METHOD,
        headers: BASE_HEADERS,
    }

    if (options.URL_DATA_NAMES) {
        let curUrlDataName;
        for (let i in options.URL_DATA_NAMES) {
            curUrlDataName = options.URL_DATA_NAMES[i];
            fetchUrl = fetchUrl.replace("{" + curUrlDataName + "}", data[curUrlDataName]);
        }
        // don't deleted because rest api ignoring odd json keys
    }

    if (data) {
        if (options.METHOD == "GET") {
            let queryParamsStr = "?" + new URLSearchParams(data).toString();
            fetchUrl += queryParamsStr;
        } else {
            fetchOptions.body = JSON.stringify(data);
        }
    }

    if (options.IS_AUTH) {
        fetchOptions.headers = makeAuthHeaders();
    }

    return [fetchUrl, fetchOptions];
}

// Returns - {JWTToken}
export const requestRegistration = makeRequestingFunc({
    URL: HTTP_ENDPOINTS_URLS.REG,
    METHOD: "POST",
    STATUSES_NOTIFICATIONS: {
        400: "Ошибка регистрации...",
    },
});

// Returns - {isAlreadyTaken}
export const requestCheckUsername = makeRequestingFunc({
    URL: HTTP_ENDPOINTS_URLS.CHECK_USERNAME,
    METHOD: "GET",
});

// Returns - {isAlreadyTaken}
export const requestCheckEmail = makeRequestingFunc({
    URL: HTTP_ENDPOINTS_URLS.CHECK_EMAIL,
    METHOD: "GET",
});

// Returns - {status}
export const requestSendEmailCode = makeRequestingFunc({
    URL: HTTP_ENDPOINTS_URLS.SEND_EMAIL_CODE,
    METHOD: "POST",
    STATUSES_NOTIFICATIONS: {
        200: "Код успешно отправлен!",
        409: "Вы не можете отправлять более одного кода в минуту!",
    },
});

// Returns - {codeIsValid}
export const requestCheckEmailCode = makeRequestingFunc({
    URL: HTTP_ENDPOINTS_URLS.CHECK_EMAIL_CODE,
    METHOD: "GET",
});

// Returns - {JWTToken}
export const requestAuthByUsernameAndPassword = makeRequestingFunc({
    URL: HTTP_ENDPOINTS_URLS.AUTH,
    METHOD: "POST",
    STATUSES_NOTIFICATIONS: {
        403: "Неверный логин или пароль!",
    },
});

// Returns - {id, firstName, lastName, ?username, ?email}
export const requestUserInfo = makeRequestingFunc({
    URL: HTTP_ENDPOINTS_URLS.USER_INFO,
    METHOD: "GET",
    IS_AUTH: true,
    STATUSES_NOTIFICATIONS: {
        404: "Пользователь с таким ID не найден!",
    },
    ERROR_FUNCS: {
        401: redirectToLoginPage,
    },
});

// Returns - {chats: [{id, name, isGroup, lastMessage, users}, ...]}
export const requestUserChats = makeRequestingFunc({
    URL: HTTP_ENDPOINTS_URLS.USER_CHATS,
    METHOD: "GET",
    IS_AUTH: true,
    ERROR_FUNCS: {
        401: redirectToLoginPage,
    },
});

// Returns - {messages: [{id, chatId, text, creatingDatetime, user}, ...]}
export const requestChatHistory = makeRequestingFunc({
    URL: HTTP_ENDPOINTS_URLS.CHAT_HISTORY,
    URL_DATA_NAMES: ["chatId"],
    METHOD: "GET",
    IS_AUTH: true,
    ERROR_FUNCS: {
        401: redirectToLoginPage,
    },
});

// Returns - {JWTToken}
export const requestNewJWTToken = makeRequestingFunc({
    URL: HTTP_ENDPOINTS_URLS.REFRESH_TOKEN,
    METHOD: "POST",
    IS_AUTH: true,
    ERROR_FUNCS: {
        401: redirectToLoginPage,
    },
});
