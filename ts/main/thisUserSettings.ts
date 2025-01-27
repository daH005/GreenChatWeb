import { thisUser } from "../common/thisUser.js";
import { requestToEditUser, requestToEditUserAvatar, requestToEditUserBackground } from "../common/http/functions.js";
import { setInputAsInvalidAndNotifyWithThrow, removeInvalidClassForAllInputs } from "../common/inputsHighlighting.js";
import { CURRENT_LABELS } from "../common/languages/labels.js";
import { updateBackgroundUrl } from "./background.js";
import { updateUserFullName } from "./thisUser.js";

var avatarSrcBackup: string;
var backgroundSrcBackup: string;
const SETTINGS_HIDDEN_CLASS: string = "sidebar__user-settings--hidden";

const settingsEl: HTMLElement = document.getElementById("js-user-settings");
const settingsOpenButtonEl: HTMLButtonElement = <HTMLButtonElement>document.getElementById("js-user-settings-open");

const avatarEl: HTMLImageElement = <HTMLImageElement>document.getElementById("js-user-avatar");
const avatarChangeButtonEl: HTMLButtonElement = <HTMLButtonElement>document.getElementById("js-user-settings-avatar-change-button");
const avatarInputEl: HTMLInputElement = <HTMLInputElement>document.getElementById("js-user-settings-avatar-input");

const firstNameInputEl: HTMLInputElement = <HTMLInputElement>document.getElementById("js-user-settings-first-name");
const lastNameInputEl: HTMLInputElement = <HTMLInputElement>document.getElementById("js-user-settings-last-name");

const backgroundEl: HTMLImageElement = <HTMLImageElement>document.getElementById("js-background");
const backgroundChangeButtonEl: HTMLButtonElement = <HTMLButtonElement>document.getElementById("js-user-settings-background-change-button");
const backgroundInputEl: HTMLInputElement = <HTMLInputElement>document.getElementById("js-user-settings-background-input");

const saveButtonEl: HTMLButtonElement = <HTMLButtonElement>document.getElementById("js-user-settings-save");
const closeButtonEl: HTMLButtonElement = <HTMLButtonElement>document.getElementById("js-user-settings-close");

settingsOpenButtonEl.onclick = () => {
    settingsEl.classList.remove(SETTINGS_HIDDEN_CLASS);
}

avatarChangeButtonEl.onclick = () => {
    avatarInputEl.click();
}

avatarEl.onload = () => {
    updateAvatarSrcBackup();
    avatarEl.onload = () => {}
}

avatarInputEl.oninput = () => {
    let url: string = URL.createObjectURL(avatarInputEl.files[0]);
    avatarEl.src = url;
}

firstNameInputEl.value = thisUser.firstName;
firstNameInputEl.oninput = () => {
    updateUserFullNameWrap();
}

lastNameInputEl.value = thisUser.lastName;
lastNameInputEl.oninput = () => {
    updateUserFullNameWrap();
}

backgroundChangeButtonEl.onclick = () => {
    backgroundInputEl.click();
}

backgroundEl.onload = () => {
    updateBackgroundSrcBackup();
    backgroundEl.onload = () => {}
}

backgroundInputEl.oninput = () => {
    let url: string = URL.createObjectURL(backgroundInputEl.files[0]);
    updateBackgroundUrl(url);
}

saveButtonEl.onclick = async () => {
    if (avatarInputEl.files.length) {
        await requestToEditUserAvatar(avatarInputEl.files[0]);
        avatarInputEl.value = "";
        updateAvatarSrcBackup();
    }

    if (backgroundInputEl.files.length) {
        await requestToEditUserBackground(backgroundInputEl.files[0]);
        backgroundInputEl.value = "";
        updateBackgroundSrcBackup();
    }

    if (!firstNameInputEl.value) {
        setInputAsInvalidAndNotifyWithThrow(firstNameInputEl, CURRENT_LABELS.inputFirstName);
    }

    if (!lastNameInputEl.value) {
        setInputAsInvalidAndNotifyWithThrow(lastNameInputEl, CURRENT_LABELS.inputLastName);
    }

    if (thisUser.firstName != firstNameInputEl.value || thisUser.lastName != lastNameInputEl.value) {
        thisUser.firstName = firstNameInputEl.value;
        thisUser.lastName = lastNameInputEl.value;

        await requestToEditUser({
            firstName: firstNameInputEl.value,
            lastName: lastNameInputEl.value,
        });
    }

    removeInvalidClassForAllInputs();
    settingsEl.classList.add(SETTINGS_HIDDEN_CLASS);
}

closeButtonEl.onclick = () => {
    avatarEl.src = avatarSrcBackup;
    avatarInputEl.value = "";

    firstNameInputEl.value = thisUser.firstName;
    lastNameInputEl.value = thisUser.lastName;
    updateUserFullNameWrap();

    updateBackgroundUrl(backgroundSrcBackup);
    backgroundInputEl.value = "";

    settingsEl.classList.add(SETTINGS_HIDDEN_CLASS);
}

function updateUserFullNameWrap(): void {
    updateUserFullName(firstNameInputEl.value + " " + lastNameInputEl.value);
}

function updateAvatarSrcBackup(): void {
    avatarSrcBackup = avatarEl.src;
}

function updateBackgroundSrcBackup(): void {
    backgroundSrcBackup = backgroundEl.style.background.slice(5, -2);
}
