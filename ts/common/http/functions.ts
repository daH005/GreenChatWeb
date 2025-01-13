import { AlreadyTakenFlag,
         CodeIsValidFlag,
         User,
         ChatHistory,
         UserChats,
         MessageStorageId,
         MessageFilenames,
       } from "../apiDataInterfaces.js";
import { notify } from "../notification.js";
import { HTTP_API_URLS } from "./apiUrls.js";
import { EmailRequestData,
         EmailAndCodeRequestData,
         UserIdRequestData,
         UserEditRequestData,
         ChatHistoryRequestData,
       } from "./requestDataInterfaces.js";
import { makeUrlWithParams, commonFetch, JSONFromResponseOrNull } from "./base.js";

export async function requestToCheckEmail(requestData: EmailRequestData): Promise<AlreadyTakenFlag> {
    let response: Response = await commonFetch(makeUrlWithParams(HTTP_API_URLS.USER_EMAIL_CHECK, requestData), {
        method: "GET",
    });
    return await response.json();
}

export async function requestToSendEmailCode(requestData: EmailRequestData): Promise<null> {
    let response: Response = await commonFetch(HTTP_API_URLS.USER_EMAIL_CODE_SEND, {
        method: "POST",
        body: requestData,
    });

    if (response.status == 200) {
        notify("Код успешно отправлен!")
    } else if (response.status == 409) {
        notify("Вы не можете отправлять более одного кода в минуту!");
    }

    return await JSONFromResponseOrNull(response);
}

export async function requestToCheckEmailCode(requestData: EmailAndCodeRequestData): Promise<CodeIsValidFlag> {
    let response: Response = await commonFetch(makeUrlWithParams(HTTP_API_URLS.USER_EMAIL_CODE_CHECK, requestData), {
        method: "GET",
    });
    return await response.json();
}

export async function requestToLogin(requestData: EmailAndCodeRequestData): Promise<null> {
    let response: Response = await commonFetch(HTTP_API_URLS.USER_LOGIN, {
        method: "POST",
        body: requestData,
    });

    if (response.status == 403) {
        notify("Неверный логин или пароль!")
    }

    return await JSONFromResponseOrNull(response);
}

export async function requestToLogout(): Promise<null> {
    let response: Response = await commonFetch(HTTP_API_URLS.USER_LOGOUT, {
        method: "POST",
    });
    return await JSONFromResponseOrNull(response);
}

export async function requestUser(requestData: UserIdRequestData | null): Promise<User> {
    if (!requestData) {
        requestData = <UserIdRequestData>{};
    }

    let response: Response = await commonFetch(makeUrlWithParams(HTTP_API_URLS.USER, requestData), {
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

export async function requestToEditUser(requestData: UserEditRequestData): Promise<null> {
    let response: Response = await commonFetch(HTTP_API_URLS.USER_EDIT, {
        method: "PUT",
        body: requestData,
    });
    return await JSONFromResponseOrNull(response);
}

export async function requestToEditUserAvatar(image: Blob): Promise<null> {
    let response: Response = await commonFetch(HTTP_API_URLS.USER_AVATAR_EDIT, {
        method: "PUT",
        body: image,
    });

    if (response.status == 413) {
        notify("Вес аватарки слишком велик, бро!");
    }

    return await JSONFromResponseOrNull(response);
}

export async function requestToEditUserBackground(image: Blob): Promise<null> {
    let response: Response = await commonFetch(HTTP_API_URLS.USER_BACKGROUND_EDIT, {
        method: "PUT",
        body: image,
    });

    if (response.status == 413) {
        notify("А фончик ничего себе весит-то! Полегче...");
    }

    return await JSONFromResponseOrNull(response);
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

export async function requestToSaveMessageFiles(files: FileList): Promise<MessageStorageId> {
    let formData = new FormData();
    for (let i = 0; i < files.length; i++) {
        formData.append('files', files[i]);
    }

    let response: Response = await commonFetch(HTTP_API_URLS.MESSAGES_FILES_SAVE, {
        method: "POST",
        body: formData,
    });

    if (response.status == 413) {
        notify("Суммарный вес файлов слишком велик!");
    }

    return await response.json();
}

export async function requestMessageFilenames(storageId: number): Promise<string[]> {
    let response: Response = await commonFetch(makeUrlWithParams(HTTP_API_URLS.MESSAGES_FILES_NAMES, {storageId}), {
        method: "GET",
    });
    let data = await response.json();
    return data.filenames;
}
