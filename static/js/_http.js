import { BASE_HEADERS, HTTP_ENDPOINTS_URLS } from "./_config.js";
import { redirectToLoginPage } from "./_redirects.js";
import { makeAuthorizationHeaders } from "./_authorizationTools.js";

const RESPONSE_TYPES = {
    JSON: "json",
    BLOB: "blob",
}

export function makeRequestingFunc(options) {
    options = {
        STATUSES_NOTIFICATIONS: {},
        ERROR_FUNCS: {},
        RESPONSE_TYPE: RESPONSE_TYPES.JSON,
        REQUEST_BODY_IS_JSON: true,
        ...options,
    }
    async function request(data) {
        let [fetchUrl, fetchOptions] = makeRequestingUrlAndOptions(options, data);

        let response = await fetch(fetchUrl, fetchOptions);
        if (response.status in options.STATUSES_NOTIFICATIONS) {
            notify(options.STATUSES_NOTIFICATIONS[response.status]);
        }

        if (response.ok) {
            return await response[options.RESPONSE_TYPE]();
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
    }

    if (options.REQUEST_BODY_IS_JSON) {
        fetchOptions.headers = BASE_HEADERS;
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
        } else if (options.REQUEST_BODY_IS_JSON) {
            fetchOptions.body = JSON.stringify(data);
        } else {
            fetchOptions.body = data;
        }
    }

    if (options.AUTHORIZATION_IS_REQUIRED) {
        fetchOptions.headers = {
            ...fetchOptions.headers,
            ...makeAuthorizationHeaders(),
        }
    }

    return [fetchUrl, fetchOptions];
}

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

// Returns - {JWT}
export const requestLogin = makeRequestingFunc({
    URL: HTTP_ENDPOINTS_URLS.LOGIN,
    METHOD: "POST",
    STATUSES_NOTIFICATIONS: {
        403: "Неверный логин или пароль!",
    },
});

// Returns - {id, firstName, lastName, ?email}
export const requestUserInfo = makeRequestingFunc({
    URL: HTTP_ENDPOINTS_URLS.USER_INFO,
    METHOD: "GET",
    AUTHORIZATION_IS_REQUIRED: true,
    STATUSES_NOTIFICATIONS: {
        404: "Пользователь с таким ID не найден!",
    },
    ERROR_FUNCS: {
        401: redirectToLoginPage,
    },
});

// Returns image file
export const requestUserAvatar = makeRequestingFunc({
    URL: HTTP_ENDPOINTS_URLS.USER_AVATAR,
    METHOD: "GET",
    AUTHORIZATION_IS_REQUIRED: true,
    REQUEST_BODY_IS_JSON: false,
    RESPONSE_TYPE: RESPONSE_TYPES.BLOB,
});

// Returns - {status}
export const requestUserEditInfo = makeRequestingFunc({
    URL: HTTP_ENDPOINTS_URLS.USER_EDIT_INFO,
    METHOD: "PUT",
    AUTHORIZATION_IS_REQUIRED: true,
});

// Returns - {status}
export const requestUserEditAvatar = makeRequestingFunc({
    URL: HTTP_ENDPOINTS_URLS.USER_EDIT_AVATAR,
    METHOD: "PUT",
    AUTHORIZATION_IS_REQUIRED: true,
    REQUEST_BODY_IS_JSON: false,
});

// Returns - {chats: [{id, name, isGroup, lastMessage, usersIds, unreadCount}, ...]}
export const requestUserChats = makeRequestingFunc({
    URL: HTTP_ENDPOINTS_URLS.USER_CHATS,
    METHOD: "GET",
    AUTHORIZATION_IS_REQUIRED: true,
    ERROR_FUNCS: {
        401: redirectToLoginPage,
    },
});

// Returns - {messages: [{id, chatId, text, creatingDatetime, userId, isRead}, ...]}
export const requestChatHistory = makeRequestingFunc({
    URL: HTTP_ENDPOINTS_URLS.CHAT_HISTORY,
    METHOD: "GET",
    AUTHORIZATION_IS_REQUIRED: true,
    ERROR_FUNCS: {
        401: redirectToLoginPage,
    },
});

// Returns - {JWT}
export const requestNewJWT = makeRequestingFunc({
    URL: HTTP_ENDPOINTS_URLS.REFRESH_TOKEN,
    METHOD: "POST",
    AUTHORIZATION_IS_REQUIRED: true,
    ERROR_FUNCS: {
        401: redirectToLoginPage,
    },
});
