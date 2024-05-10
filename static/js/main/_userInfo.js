import { user } from "./_user.js";
import { setAvatar } from "./_avatars.js";

const avatarImageEl = document.getElementById("js-user-avatar");

const userNameEl = document.getElementById("js-user-name");
const userIdParentEl = document.getElementById("js-user-id-parent");
userIdParentEl.onclick = () => {
    navigator.clipboard.writeText(userIdEl.textContent);
    notify("ID успешно скопирован!");
}

const userIdEl = document.getElementById("js-user-id");

export async function updateUserInfo(user) {
    updateUserFullName(user.firstName + " " + user.lastName);
    userIdEl.textContent = user.id;

    await setAvatar(avatarImageEl, user.id);
}

export function updateUserFullName(fullName) {
    userNameEl.textContent = fullName;
}