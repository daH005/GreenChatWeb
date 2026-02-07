import { APIUser,
         APIChat,
         APIMessage,
       } from "../apiDataInterfaces.js";
import { notify } from "../notification.js";
import { CURRENT_LABELS } from "../languages/labels.js";
import { HTTP_API_URLS } from "./apiUrls.js";
import { EmailAndCodeRequestData,
         UserEditRequestData,
         NewChatRequestData,
         NewMessageRequestData,
         MessageEditRequestData,
         MessageFilesDeleteRequestData,
         PaginationRequestData,
       } from "./requestDataInterfaces.js";
import { makeUrlWithParams, commonFetch } from "./base.js";

export async function requestToSendEmailCode(email: string) {
    let response: Response = await commonFetch(HTTP_API_URLS.USER_EMAIL_CODE_SEND, {
        method: "POST",
        body: {email},
    });

    if (response.status == 202) {
        notify(CURRENT_LABELS.codeWasSent)
    } else if (response.status == 409) {
        notify(CURRENT_LABELS.codeSpam);
    }
}

export async function requestToCheckEmailCode(requestData: EmailAndCodeRequestData): Promise<boolean> {
    let response: Response = await commonFetch(makeUrlWithParams(HTTP_API_URLS.USER_EMAIL_CODE_CHECK, requestData), {
        method: "GET",
    });
    let data = await response.json();
    return data.isThat;
}

export async function requestToLogin(requestData: EmailAndCodeRequestData) {
    let response: Response = await commonFetch(HTTP_API_URLS.USER_LOGIN, {
        method: "POST",
        body: requestData,
    });

    if (response.status == 403) {
        notify(CURRENT_LABELS.invalidLogin);
    }
}

export async function requestToLogout() {
    let response: Response = await commonFetch(HTTP_API_URLS.USER_LOGOUT, {
        method: "POST",
    });
}

// null key stores the current user.
let __userCashes = {};
export async function requestUser(userId: number | null = null): Promise<APIUser> {
    if (__userCashes[userId]) {
        return __userCashes[userId];
    }

    let requestData;
    if (userId != null) {
        requestData = {userId};
    } else {
        requestData = {};
    }

    let response: Response = await commonFetch(makeUrlWithParams(HTTP_API_URLS.USER, requestData), {
        method: "GET",
    });

    if (response.status == 404) {
        notify(CURRENT_LABELS.invalidUserId);
        throw new Error();
    }

    __userCashes[userId] = await response.json();
    return __userCashes[userId];
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
        notify(CURRENT_LABELS.successUpdate);
    }
}

export async function requestToEditUserAvatar(image: Blob) {
    let response: Response = await commonFetch(HTTP_API_URLS.USER_AVATAR_EDIT, {
        method: "PUT",
        body: image,
    });

    if (response.status == 413) {
        notify(CURRENT_LABELS.largeAvatar);
    } else if (response.status == 200) {
        notify(CURRENT_LABELS.successUpdate);
    }
}

export async function requestToEditUserBackground(image: Blob) {
    let response: Response = await commonFetch(HTTP_API_URLS.USER_BACKGROUND_EDIT, {
        method: "PUT",
        body: image,
    });

    if (response.status == 413) {
        notify(CURRENT_LABELS.largeBackground);
    } else if (response.status == 200) {
        notify(CURRENT_LABELS.successUpdate);
    }
}

export async function requestUserChats(pagination: PaginationRequestData = {}): Promise<APIChat[]> {
    let response: Response = await commonFetch(makeUrlWithParams(HTTP_API_URLS.USER_CHATS, pagination), {
        method: "GET",
    });
    return await response.json();
}

export async function requestChat(chatId: number): Promise<APIChat> {
    let response: Response = await commonFetch(makeUrlWithParams(HTTP_API_URLS.CHAT, {chatId}), {
        method: "GET",
    });
    return await response.json();
}

export async function requestChatByInterlocutor(interlocutorId: number): Promise<APIChat> {
    let response: Response = await commonFetch(makeUrlWithParams(HTTP_API_URLS.CHAT_BY_INTERLOCUTOR, {interlocutorId}), {
        method: "GET",
    });
    return await response.json();
}

export async function requestNewChat(requestData: NewChatRequestData): Promise<APIChat> {
    let response: Response = await commonFetch(HTTP_API_URLS.CHAT_NEW, {
        method: "POST",
        body: requestData,
    });

    return await response.json();
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

export async function requestMessages(chatId: number,
                                      pagination: PaginationRequestData = {},
                                      ): Promise<APIMessage[]> {
    let response: Response = await commonFetch(makeUrlWithParams(HTTP_API_URLS.CHAT_MESSAGES, {chatId, ...pagination}), {
        method: "GET",
    });
    return await response.json();
}

export async function requestMessage(messageId: number): Promise<APIMessage> {
    let response: Response = await commonFetch(makeUrlWithParams(HTTP_API_URLS.MESSAGE, {messageId}), {
        method: "GET",
    });
    return await response.json();
}

export async function requestNewMessage(requestData: NewMessageRequestData): Promise<APIMessage> {
    let response: Response = await commonFetch(HTTP_API_URLS.MESSAGE_NEW, {
        method: "POST",
        body: requestData,
    });

    return await response.json();
}

export async function requestToEditMessage(requestData: MessageEditRequestData) {
    let response: Response = await commonFetch(HTTP_API_URLS.MESSAGE_EDIT, {
        method: "PUT",
        body: requestData,
    });
}

export async function requestToDeleteMessage(messageId: number) {
    let response: Response = await commonFetch(HTTP_API_URLS.MESSAGE_DELETE, {
        method: "DELETE",
        body: {messageId},
    });
}

export async function requestToReadMessage(messageId: number) {
    let response: Response = await commonFetch(HTTP_API_URLS.MESSAGE_READ, {
        method: "PUT",
        body: {messageId},
    });
}

export async function requestToUpdateMessageFiles(messageId: number,
                                                  files: FileList,
                                                  ) {
    let formData = new FormData();
    for (let i = 0; i < files.length; i++) {
        formData.append('files', files[i]);
    }

    let response: Response = await commonFetch(makeUrlWithParams(HTTP_API_URLS.MESSAGE_FILES_UPDATE, {messageId}), {
        method: "PUT",
        body: formData,
    });

    if (response.status == 413) {
        notify(CURRENT_LABELS.largeFiles);
        throw new Error();
    }
}

export async function requestToDeleteMessageFiles(requestData: MessageFilesDeleteRequestData){
    let response: Response = await commonFetch(HTTP_API_URLS.MESSAGE_FILES_DELETE, {
        method: "DELETE",
        body: requestData,
    });
}

export async function requestMessageFilenames(messageId: number): Promise<string[]> {
    let response: Response = await commonFetch(makeUrlWithParams(HTTP_API_URLS.MESSAGE_FILES_NAMES, {messageId}), {
        method: "GET",
    });
    return await response.json();
}
