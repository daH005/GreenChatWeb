import { notify } from "../common/notification.js";
import { thisUser } from "../common/thisUser.js";
import { requestToEditUserInfo, requestToEditUserAvatar } from "../common/http/functions.js";
import { setInputAsInvalidAndNotifyWithThrow, removeInvalidClassForAllInputs } from "../common/inputsHighlighting.js";
import { updateUserFullName } from "./thisUserInfo.js";

var avatarSrcBackup: string;
const SETTINGS_HIDDEN_CLASS: string = "sidebar__user-settings--hidden";

const settingsEl: HTMLElement = document.getElementById("js-user-settings");
const settingsOpenButtonEl: HTMLButtonElement = <HTMLButtonElement>document.getElementById("js-user-settings-open");
const avatarImageEl: HTMLImageElement = <HTMLImageElement>document.getElementById("js-user-avatar");
const avatarChangeButtonEl: HTMLButtonElement = <HTMLButtonElement>document.getElementById("js-user-settings-avatar-change-button");
const avatarInputEl: HTMLInputElement = <HTMLInputElement>document.getElementById("js-user-settings-avatar-input");
const firstNameInputEl: HTMLInputElement = <HTMLInputElement>document.getElementById("js-user-settings-first-name");
const lastNameInputEl: HTMLInputElement = <HTMLInputElement>document.getElementById("js-user-settings-last-name");
const saveButtonEl: HTMLButtonElement = <HTMLButtonElement>document.getElementById("js-user-settings-save");
const closeButtonEl: HTMLButtonElement = <HTMLButtonElement>document.getElementById("js-user-settings-close");

settingsOpenButtonEl.onclick = () => {
    settingsEl.classList.remove(SETTINGS_HIDDEN_CLASS);
}

avatarChangeButtonEl.onclick = () => {
    avatarInputEl.click();
}

avatarImageEl.onload = () => {
    avatarSrcBackup = avatarImageEl.src;
    avatarImageEl.onload = () => {}
}

avatarInputEl.oninput = () => {
    avatarSrcBackup = avatarImageEl.src;

    let imageFileURL: string = URL.createObjectURL(avatarInputEl.files[0]);
    avatarImageEl.src = imageFileURL;
}

firstNameInputEl.value = thisUser.firstName;
firstNameInputEl.oninput = () => {
    updateUserFullNameWrap();
}

lastNameInputEl.value = thisUser.lastName;
lastNameInputEl.oninput = () => {
    updateUserFullNameWrap();
}

saveButtonEl.onclick = async () => {
    let updatingWas = false;

    if (avatarInputEl.files.length) {
        await requestToEditUserAvatar(avatarInputEl.files[0]);
        avatarInputEl.value = "";
        updatingWas = true;
    }

    if (!firstNameInputEl.value) {
        setInputAsInvalidAndNotifyWithThrow(firstNameInputEl, "Введите имя!");
    }

    if (!lastNameInputEl.value) {
        setInputAsInvalidAndNotifyWithThrow(lastNameInputEl, "Введите фамилию!");
    }

    if (thisUser.firstName != firstNameInputEl.value || thisUser.lastName != lastNameInputEl.value) {
        thisUser.firstName = firstNameInputEl.value;
        thisUser.lastName = lastNameInputEl.value;

        await requestToEditUserInfo({
            firstName: firstNameInputEl.value,
            lastName: lastNameInputEl.value,
        });

        updatingWas = true;
    }

    if (updatingWas) {
        notify("Данные успешно обновлены!");
    } else {
        notify("Вы ничего не изменили!");
        return;
    }

    removeInvalidClassForAllInputs();
    settingsEl.classList.add(SETTINGS_HIDDEN_CLASS);
}

closeButtonEl.onclick = () => {
    avatarImageEl.src = avatarSrcBackup;
    avatarInputEl.value = "";

    firstNameInputEl.value = thisUser.firstName;
    lastNameInputEl.value = thisUser.lastName;
    updateUserFullNameWrap();

    settingsEl.classList.add(SETTINGS_HIDDEN_CLASS);
}

function updateUserFullNameWrap(): void {
    updateUserFullName(firstNameInputEl.value + " " + lastNameInputEl.value);
}
