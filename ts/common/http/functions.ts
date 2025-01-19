import { User,
         Chat,
         Message,
       } from "../apiDataInterfaces.js";
import { notify } from "../notification.js";
import { HTTP_API_URLS } from "./apiUrls.js";
import { EmailAndCodeRequestData,
         UserEditRequestData,
         NewChatRequestData,
         NewMessageRequestData,
         MessagesRequestData,
       } from "./requestDataInterfaces.js";
import { makeUrlWithParams, commonFetch } from "./base.js";

export async function requestToSendEmailCode(email: string) {
    let response: Response = await commonFetch(HTTP_API_URLS.USER_EMAIL_CODE_SEND, {
        method: "POST",
        body: {email},
    });

    if (response.status == 202) {
        notify("Код успешно отправлен!")
    } else if (response.status == 409) {
        notify("Вы не можете отправлять более одного кода в минуту!");
    }
}

export async function requestToCheckEmailCode(requestData: EmailAndCodeRequestData): Promise<boolean> {
    let response: Response = await commonFetch(makeUrlWithParams(HTTP_API_URLS.USER_EMAIL_CODE_CHECK, requestData), {
        method: "GET",
    });
    let data = await response.json();
    return data.codeIsValid;
}

export async function requestToLogin(requestData: EmailAndCodeRequestData) {
    let response: Response = await commonFetch(HTTP_API_URLS.USER_LOGIN, {
        method: "POST",
        body: requestData,
    });

    if (response.status == 403) {
        notify("Неверный логин или пароль!")
    }
}

export async function requestToLogout() {
    let response: Response = await commonFetch(HTTP_API_URLS.USER_LOGOUT, {
        method: "POST",
    });
}

export async function requestUser(userId: number | null): Promise<User> {
    let requestData;
    if (userId) {
        requestData = {userId};
    } else {
        requestData = {};
    }

    let response: Response = await commonFetch(makeUrlWithParams(HTTP_API_URLS.USER, requestData), {
        method: "GET",
    });

    if (response.status == 404) {
        notify("Пользователь с таким ID не найден!");
        throw new Error();
    }

    return await response.json();
}

export async function requestUserAvatar(userId: number): Promise<Blob> {
    let response: Response = await commonFetch(makeUrlWithParams(HTTP_API_URLS.USER_AVATAR, {userId}), {
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

export async function requestToEditUser(requestData: UserEditRequestData) {
    let response: Response = await commonFetch(HTTP_API_URLS.USER_EDIT, {
        method: "PUT",
        body: requestData,
    });

    if (response.status == 200) {
        notify("Данные успешно обновлены!");
    }
}

export async function requestToEditUserAvatar(image: Blob) {
    let response: Response = await commonFetch(HTTP_API_URLS.USER_AVATAR_EDIT, {
        method: "PUT",
        body: image,
    });

    if (response.status == 413) {
        notify("Вес аватарки слишком велик, бро!");
    } else if (response.status == 200) {
        notify("Данные успешно обновлены!");
    }
}

export async function requestToEditUserBackground(image: Blob) {
    let response: Response = await commonFetch(HTTP_API_URLS.USER_BACKGROUND_EDIT, {
        method: "PUT",
        body: image,
    });

    if (response.status == 413) {
        notify("А фончик ничего себе весит-то! Полегче...");
    } else if (response.status == 200) {
        notify("Данные успешно обновлены!");
    }
}

export async function requestUserChats(): Promise<Chat[]> {
    let response: Response = await commonFetch(HTTP_API_URLS.USER_CHATS, {
        method: "GET",
    });
    let data = await response.json();
    return data.chats;
}

export async function requestChat(chatId: number): Promise<Chat> {
    let response: Response = await commonFetch(makeUrlWithParams(HTTP_API_URLS.CHAT, {chatId}), {
        method: "GET",
    });
    return await response.json();
}

export async function requestNewChat(requestData: NewChatRequestData) {
    let response: Response = await commonFetch(HTTP_API_URLS.CHAT_NEW, {
        method: "POST",
        body: requestData,
    });
}

export async function requestTyping(chatId: number) {
    let response: Response = await commonFetch(HTTP_API_URLS.CHAT_TYPING, {
        method: "POST",
        body: {chatId},
    });
}

export async function requestUnreadCount(chatId: number): Promise<number> {
    let response: Response = await commonFetch(makeUrlWithParams(HTTP_API_URLS.CHAT_UNREAD_COUNT, {chatId}), {
        method: "GET",
    });
    let data = await response.json();
    return data.unreadCount;
}

export async function requestMessage(messageId: number): Promise<Message> {
    let response: Response = await commonFetch(makeUrlWithParams(HTTP_API_URLS.CHAT_MESSAGE, {messageId}), {
        method: "GET",
    });
    return await response.json();
}

export async function requestNewMessage(requestData: NewMessageRequestData) {
    let response: Response = await commonFetch(HTTP_API_URLS.CHAT_MESSAGE_NEW, {
        method: "POST",
        body: requestData,
    });
}

export async function requestToReadMessage(messageId: number) {
    let response: Response = await commonFetch(HTTP_API_URLS.CHAT_MESSAGE_READ, {
        method: "PUT",
        body: {messageId},
    });
}

export async function requestMessages(requestData: MessagesRequestData): Promise<Message[]> {
    let response: Response = await commonFetch(makeUrlWithParams(HTTP_API_URLS.CHAT_MESSAGES, requestData), {
        method: "GET",
    });
    let data = await response.json();
    return data.messages;
}

export async function requestToSaveMessageFiles(files: FileList): Promise<number> {
    let formData = new FormData();
    for (let i = 0; i < files.length; i++) {
        formData.append('files', files[i]);
    }

    let response: Response = await commonFetch(HTTP_API_URLS.CHAT_MESSAGE_FILES_SAVE, {
        method: "POST",
        body: formData,
    });

    if (response.status == 413) {
        notify("Суммарный вес файлов слишком велик!");
        throw new Error();
    }

    let data = await response.json();
    return data.storageId;
}

export async function requestMessageFilenames(storageId: number): Promise<string[]> {
    let response: Response = await commonFetch(makeUrlWithParams(HTTP_API_URLS.CHAT_MESSAGE_FILES_NAMES, {storageId}), {
        method: "GET",
    });
    let data = await response.json();
    return data.filenames;
}
