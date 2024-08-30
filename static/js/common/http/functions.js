import { redirectToLoginPage } from "../redirects.js";
import { HTTP_API_URLS } from "./endpoints.js";
import { ResponseDataType, makeRequestFunc, makeRequestFuncWithoutRequestData } from "./base.js";
export const requestToCheckEmail = makeRequestFunc({
    URL: HTTP_API_URLS.EMAIL_CHECK,
    METHOD: "GET",
});
export const requestToSendEmailCode = makeRequestFunc({
    URL: HTTP_API_URLS.EMAIL_CODE_SEND,
    METHOD: "POST",
    STATUSES_NOTIFICATIONS: {
        200: "Код успешно отправлен!",
        409: "Вы не можете отправлять более одного кода в минуту!",
    },
});
export const requestToCheckEmailCode = makeRequestFunc({
    URL: HTTP_API_URLS.EMAIL_CODE_CHECK,
    METHOD: "GET",
});
export const requestToLogin = makeRequestFunc({
    URL: HTTP_API_URLS.LOGIN,
    METHOD: "POST",
    STATUSES_NOTIFICATIONS: {
        403: "Неверный логин или пароль!",
    },
});
export const requestUserInfo = makeRequestFunc({
    URL: HTTP_API_URLS.USER_INFO,
    METHOD: "GET",
    AUTHORIZATION_IS_REQUIRED: true,
    STATUSES_NOTIFICATIONS: {
        404: "Пользователь с таким ID не найден!",
    },
    STATUSES_FUNCTIONS: {
        401: redirectToLoginPage,
    },
});
export const requestUserAvatar = makeRequestFunc({
    URL: HTTP_API_URLS.USER_AVATAR,
    METHOD: "GET",
    AUTHORIZATION_IS_REQUIRED: true,
    REQUEST_DATA_IS_JSON: false,
    RESPONSE_DATA_TYPE: ResponseDataType.BLOB,
});
export const requestUserBackground = makeRequestFuncWithoutRequestData({
    URL: HTTP_API_URLS.USER_BACKGROUND,
    METHOD: "GET",
    AUTHORIZATION_IS_REQUIRED: true,
    REQUEST_DATA_IS_JSON: false,
    RESPONSE_DATA_TYPE: ResponseDataType.BLOB,
});
export const requestToEditUserInfo = makeRequestFunc({
    URL: HTTP_API_URLS.USER_INFO_EDIT,
    METHOD: "PUT",
    AUTHORIZATION_IS_REQUIRED: true,
});
export const requestToEditUserAvatar = makeRequestFunc({
    URL: HTTP_API_URLS.USER_AVATAR_EDIT,
    METHOD: "PUT",
    AUTHORIZATION_IS_REQUIRED: true,
    REQUEST_DATA_IS_JSON: false,
});
export const requestToEditUserBackground = makeRequestFunc({
    URL: HTTP_API_URLS.USER_BACKGROUND_EDIT,
    METHOD: "PUT",
    AUTHORIZATION_IS_REQUIRED: true,
    REQUEST_DATA_IS_JSON: false,
});
export const requestUserChats = makeRequestFuncWithoutRequestData({
    URL: HTTP_API_URLS.USER_CHATS,
    METHOD: "GET",
    AUTHORIZATION_IS_REQUIRED: true,
    STATUSES_FUNCTIONS: {
        401: redirectToLoginPage,
    },
});
export const requestChatHistory = makeRequestFunc({
    URL: HTTP_API_URLS.CHAT_HISTORY,
    METHOD: "GET",
    AUTHORIZATION_IS_REQUIRED: true,
    STATUSES_FUNCTIONS: {
        401: redirectToLoginPage,
    },
});
export const requestNewJWT = makeRequestFuncWithoutRequestData({
    URL: HTTP_API_URLS.REFRESH_TOKEN,
    METHOD: "POST",
    AUTHORIZATION_IS_REQUIRED: true,
    STATUSES_FUNCTIONS: {
        401: redirectToLoginPage,
    },
});
