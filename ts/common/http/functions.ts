import { SimpleResponseStatus,
         AlreadyTakenFlag,
         CodeIsValidFlag,
         User,
         ChatHistory,
         UserChats,
       } from "../apiDataInterfaces.js";
import { HTTP_API_URLS } from "./apiUrls.js";
import { ResponseDataType, makeRequestFunc, makeRequestFuncWithoutRequestData } from "./base.js";
import { EmailRequestData,
         EmailAndCodeRequestData,
         UserIdRequestData,
         UserInfoEditRequestData,
         ChatHistoryRequestData,
       } from "./requestDataInterfaces.js";

export const requestToCheckEmail = makeRequestFunc<EmailRequestData, AlreadyTakenFlag>({
    URL: HTTP_API_URLS.EMAIL_CHECK,
    METHOD: "GET",
});

export const requestToSendEmailCode = makeRequestFunc<EmailRequestData, SimpleResponseStatus>({
    URL: HTTP_API_URLS.EMAIL_CODE_SEND,
    METHOD: "POST",
    STATUSES_NOTIFICATIONS: {
        200: "Код успешно отправлен!",
        409: "Вы не можете отправлять более одного кода в минуту!",
    },
});

export const requestToCheckEmailCode = makeRequestFunc<EmailAndCodeRequestData, CodeIsValidFlag>({
    URL: HTTP_API_URLS.EMAIL_CODE_CHECK,
    METHOD: "GET",
});

export const requestToLogin = makeRequestFunc<EmailAndCodeRequestData, SimpleResponseStatus>({
    URL: HTTP_API_URLS.LOGIN,
    METHOD: "POST",
    STATUSES_NOTIFICATIONS: {
        403: "Неверный логин или пароль!",
    },
});

export const requestUserInfo = makeRequestFunc<UserIdRequestData | null, User>({
    URL: HTTP_API_URLS.USER_INFO,
    METHOD: "GET",
    STATUSES_NOTIFICATIONS: {
        404: "Пользователь с таким ID не найден!",
    },
});

export const requestUserAvatar = makeRequestFunc<UserIdRequestData, Blob>({
    URL: HTTP_API_URLS.USER_AVATAR,
    METHOD: "GET",
    REQUEST_DATA_IS_JSON: false,
    RESPONSE_DATA_TYPE: ResponseDataType.BLOB,
});

export const requestUserBackground = makeRequestFuncWithoutRequestData<Blob>({
    URL: HTTP_API_URLS.USER_BACKGROUND,
    METHOD: "GET",
    REQUEST_DATA_IS_JSON: false,
    RESPONSE_DATA_TYPE: ResponseDataType.BLOB,
});

export const requestToEditUserInfo = makeRequestFunc<UserInfoEditRequestData, SimpleResponseStatus>({
    URL: HTTP_API_URLS.USER_INFO_EDIT,
    METHOD: "PUT",
});

export const requestToEditUserAvatar = makeRequestFunc<Blob, SimpleResponseStatus>({
    URL: HTTP_API_URLS.USER_AVATAR_EDIT,
    METHOD: "PUT",
    REQUEST_DATA_IS_JSON: false,
});

export const requestToEditUserBackground = makeRequestFunc<Blob, SimpleResponseStatus>({
    URL: HTTP_API_URLS.USER_BACKGROUND_EDIT,
    METHOD: "PUT",
    REQUEST_DATA_IS_JSON: false,
});

export const requestUserChats = makeRequestFuncWithoutRequestData<UserChats>({
    URL: HTTP_API_URLS.USER_CHATS,
    METHOD: "GET",
});

export const requestChatHistory = makeRequestFunc<ChatHistoryRequestData, ChatHistory>({
    URL: HTTP_API_URLS.CHAT_HISTORY,
    METHOD: "GET",
});

export const requestNewJWT = makeRequestFuncWithoutRequestData<SimpleResponseStatus>({
    URL: HTTP_API_URLS.REFRESH_TOKEN,
    METHOD: "POST",
});
