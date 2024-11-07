import { requestUserAvatar } from "../common/http/functions.js";

export async function setUserAvatar(avatarImageEl: HTMLImageElement, userId: number): Promise<void> {
    avatarImageEl.src = await makeUserAvatarURL(userId);
}

export async function makeUserAvatarURL(userId: number): Promise<string> {
   let avatarFile = await requestUserAvatar({
        userId,
    });
    return URL.createObjectURL(avatarFile);
}
