import { requestUserAvatar } from "../_http.js";

export async function setAvatar(avatarImageEl, userId) {
   let avatarFile = await requestUserAvatar({
        userId,
    });
    avatarImageEl.src = URL.createObjectURL(avatarFile);
}
