import { requestUserAvatar } from "../common/http/functions.js";

export async function setAvatar(avatarImageEl: HTMLImageElement, userId: number): Promise<void> {
   let avatarFile = await requestUserAvatar({
        userId,
    });
    avatarImageEl.src = URL.createObjectURL(avatarFile);
}
