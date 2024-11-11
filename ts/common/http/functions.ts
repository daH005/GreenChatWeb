import { SimpleResponseStatus,
         AlreadyTakenFlag,
         CodeIsValidFlag,
         User,
         ChatHistory,
         UserChats,
       } from "../apiDataInterfaces.js";
import { notify } from "../notification.js";
import { HTTP_API_URLS } from "./apiUrls.js";
import { EmailRequestData,
         EmailAndCodeRequestData,
         UserIdRequestData,
         UserInfoEditRequestData,
         ChatHistoryRequestData,
       } from "./requestDataInterfaces.js";
import { makeUrlWithParams, commonFetch } from "./base.js";

export async function requestToCheckEmail(requestData: EmailRequestData): Promise<AlreadyTakenFlag> {
    let response: Response = await commonFetch(makeUrlWithParams(HTTP_API_URLS.EMAIL_CHECK, requestData), {
        method: "GET",
    });
    return await response.json();
}

export async function requestToSendEmailCode(requestData: EmailRequestData): Promise<SimpleResponseStatus> {
    let response: Response = await commonFetch(HTTP_API_URLS.EMAIL_CODE_SEND, {
        method: "POST",
        body: requestData,
    });

    if (response.status == 200) {
        notify("Код успешно отправлен!")
    } else if (response.status == 409) {
        notify("Вы не можете отправлять более одного кода в минуту!");
    }

    return await response.json();
}

export async function requestToCheckEmailCode(requestData: EmailAndCodeRequestData): Promise<CodeIsValidFlag> {
    let response: Response = await commonFetch(makeUrlWithParams(HTTP_API_URLS.EMAIL_CODE_CHECK, requestData), {
        method: "GET",
    });
    return await response.json();
}

export async function requestToLogin(requestData: EmailAndCodeRequestData): Promise<SimpleResponseStatus> {
    let response: Response = await commonFetch(HTTP_API_URLS.LOGIN, {
        method: "POST",
        body: requestData,
    });

    if (response.status == 403) {
        notify("Неверный логин или пароль!")
    }

    return await response.json();
}

export async function requestUserInfo(requestData: UserIdRequestData | null): Promise<User> {
    if (!requestData) {
        requestData = <UserIdRequestData>{};
    }

    let response: Response = await commonFetch(makeUrlWithParams(HTTP_API_URLS.USER_INFO, requestData), {
        method: "GET",
    });

    if (response.status == 404) {
        notify("Пользователь с таким ID не найден!")
    }

    return await response.json();
}

export async function requestUserAvatar(requestData: UserIdRequestData): Promise<Blob> {
    let response: Response = await commonFetch(makeUrlWithParams(HTTP_API_URLS.USER_AVATAR, requestData), {
        method: "GET",
    });
    return await response.blob();
}

export async function requestUserBackground(): Promise<Blob> {
    let response: Response = await commonFetch(HTTP_API_URLS.USER_BACKGROUND, {
        method: "GET",
    });
    return await response.blob();
}

export async function requestToEditUserInfo(requestData: UserInfoEditRequestData): Promise<SimpleResponseStatus> {
    let response: Response = await commonFetch(HTTP_API_URLS.USER_INFO_EDIT, {
        method: "PUT",
        body: requestData,
    });
    return await response.json();
}

export async function requestToEditUserAvatar(image: Blob): Promise<SimpleResponseStatus> {
    let response: Response = await commonFetch(HTTP_API_URLS.USER_AVATAR_EDIT, {
        method: "PUT",
        body: image,
    });
    return await response.json();
}

export async function requestToEditUserBackground(image: Blob): Promise<SimpleResponseStatus> {
    let response: Response = await commonFetch(HTTP_API_URLS.USER_BACKGROUND_EDIT, {
        method: "PUT",
        body: image,
    });
    return await response.json();
}

export async function requestUserChats(): Promise<UserChats> {
    let response: Response = await commonFetch(HTTP_API_URLS.USER_CHATS, {
        method: "GET",
    });
    return await response.json();
}

export async function requestChatHistory(requestData: ChatHistoryRequestData): Promise<ChatHistory> {
    let response: Response = await commonFetch(makeUrlWithParams(HTTP_API_URLS.CHAT_HISTORY, requestData), {
        method: "GET",
    });
    return await response.json();
}

export async function requestToSaveChatMessageFiles(chatMessageId: number, files: FileList): Promise<SimpleResponseStatus> {
    let formData = new FormData();
    Array.from(files).forEach((file: File) => {
        formData.append("files[]", file);
    });

    let response: Response = await commonFetch(makeUrlWithParams(HTTP_API_URLS.CHAT_MESSAGES_FILES_SAVE, {chatMessageId}), {
        method: "POST",
        body: formData,
    });
    return await response.json();
}
