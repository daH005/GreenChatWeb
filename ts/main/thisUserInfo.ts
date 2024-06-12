import { User } from "../common/apiDataInterfaces.js";
import { notify } from "../common/notification.js";
import { setAvatar } from "./avatars.js";

const avatarImageEl: HTMLImageElement = <HTMLImageElement>document.getElementById("js-user-avatar");
const userNameEl: HTMLElement = document.getElementById("js-user-name");
const userIdParentEl: HTMLElement = document.getElementById("js-user-id-parent");
const userIdEl: HTMLElement = document.getElementById("js-user-id");

userIdParentEl.onclick = async () => {
    await navigator.clipboard.writeText(userIdEl.textContent);
    notify("ID успешно скопирован!");
}

export async function updateUserInfo(user: User): Promise<void> {
    updateUserFullName(user.firstName + " " + user.lastName);
    userIdEl.textContent = String(user.id);

    await setAvatar(avatarImageEl, user.id);
}

export function updateUserFullName(fullName: string): void {
    userNameEl.textContent = fullName;
}
