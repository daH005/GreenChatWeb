import { User } from "../common/apiDataInterfaces.js";
import { notify } from "../common/notification.js";
import { CURRENT_LABELS } from "../common/languages/labels.js";
import { setUserAvatar } from "./avatars.js";

const avatarImageEl: HTMLImageElement = <HTMLImageElement>document.getElementById("js-user-avatar");
const userNameEl: HTMLElement = document.getElementById("js-user-name");
const userIdParentEl: HTMLElement = document.getElementById("js-user-id-parent");
const userIdEl: HTMLElement = document.getElementById("js-user-id");

userIdParentEl.onclick = async () => {
    await navigator.clipboard.writeText(userIdEl.textContent);
    notify(CURRENT_LABELS.idWasCopied);
}

export async function updateUser(user: User): Promise<void> {
    updateUserFullName(user.firstName + " " + user.lastName);
    userIdEl.textContent = String(user.id);

    await setUserAvatar(avatarImageEl, user.id);
}

export function updateUserFullName(fullName: string): void {
    userNameEl.textContent = fullName;
}
