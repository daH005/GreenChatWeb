import { notify } from "../common/notification.js";
import { setAvatar } from "./avatars.js";
const avatarImageEl = document.getElementById("js-user-avatar");
const userNameEl = document.getElementById("js-user-name");
const userIdParentEl = document.getElementById("js-user-id-parent");
const userIdEl = document.getElementById("js-user-id");
userIdParentEl.onclick = async () => {
    await navigator.clipboard.writeText(userIdEl.textContent);
    notify("ID успешно скопирован!");
};
export async function updateUserInfo(user) {
    updateUserFullName(user.firstName + " " + user.lastName);
    userIdEl.textContent = String(user.id);
    await setAvatar(avatarImageEl, user.id);
}
export function updateUserFullName(fullName) {
    userNameEl.textContent = fullName;
}
