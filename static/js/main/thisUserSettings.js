import { notify } from "../common/notification.js";
import { thisUser } from "../common/thisUser.js";
import { requestToEditUserInfo, requestToEditUserAvatar, requestToEditUserBackground } from "../common/http/functions.js";
import { setInputAsInvalidAndNotifyWithThrow, removeInvalidClassForAllInputs } from "../common/inputsHighlighting.js";
import { updateBackgroundUrl } from "./background.js";
import { updateUserFullName } from "./thisUserInfo.js";
var avatarSrcBackup;
var backgroundSrcBackup;
const SETTINGS_HIDDEN_CLASS = "sidebar__user-settings--hidden";
const settingsEl = document.getElementById("js-user-settings");
const settingsOpenButtonEl = document.getElementById("js-user-settings-open");
const avatarEl = document.getElementById("js-user-avatar");
const avatarChangeButtonEl = document.getElementById("js-user-settings-avatar-change-button");
const avatarInputEl = document.getElementById("js-user-settings-avatar-input");
const firstNameInputEl = document.getElementById("js-user-settings-first-name");
const lastNameInputEl = document.getElementById("js-user-settings-last-name");
const backgroundEl = document.getElementById("js-background");
const backgroundChangeButtonEl = document.getElementById("js-user-settings-background-change-button");
const backgroundInputEl = document.getElementById("js-user-settings-background-input");
const saveButtonEl = document.getElementById("js-user-settings-save");
const closeButtonEl = document.getElementById("js-user-settings-close");
settingsOpenButtonEl.onclick = () => {
    settingsEl.classList.remove(SETTINGS_HIDDEN_CLASS);
};
avatarChangeButtonEl.onclick = () => {
    avatarInputEl.click();
};
avatarEl.onload = () => {
    updateAvatarSrcBackup();
    avatarEl.onload = () => { };
};
avatarInputEl.oninput = () => {
    let url = URL.createObjectURL(avatarInputEl.files[0]);
    avatarEl.src = url;
};
firstNameInputEl.value = thisUser.firstName;
firstNameInputEl.oninput = () => {
    updateUserFullNameWrap();
};
lastNameInputEl.value = thisUser.lastName;
lastNameInputEl.oninput = () => {
    updateUserFullNameWrap();
};
backgroundChangeButtonEl.onclick = () => {
    backgroundInputEl.click();
};
backgroundEl.onload = () => {
    updateBackgroundSrcBackup();
    backgroundEl.onload = () => { };
};
backgroundInputEl.oninput = () => {
    let url = URL.createObjectURL(backgroundInputEl.files[0]);
    updateBackgroundUrl(url);
};
saveButtonEl.onclick = async () => {
    let updatingWas = false;
    if (avatarInputEl.files.length) {
        await requestToEditUserAvatar(avatarInputEl.files[0]);
        avatarInputEl.value = "";
        updateAvatarSrcBackup();
        updatingWas = true;
    }
    if (backgroundInputEl.files.length) {
        await requestToEditUserBackground(backgroundInputEl.files[0]);
        backgroundInputEl.value = "";
        updateBackgroundSrcBackup();
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
    }
    else {
        notify("Вы ничего не изменили!");
        return;
    }
    removeInvalidClassForAllInputs();
    settingsEl.classList.add(SETTINGS_HIDDEN_CLASS);
};
closeButtonEl.onclick = () => {
    avatarEl.src = avatarSrcBackup;
    avatarInputEl.value = "";
    firstNameInputEl.value = thisUser.firstName;
    lastNameInputEl.value = thisUser.lastName;
    updateUserFullNameWrap();
    updateBackgroundUrl(backgroundSrcBackup);
    backgroundInputEl.value = "";
    settingsEl.classList.add(SETTINGS_HIDDEN_CLASS);
};
function updateUserFullNameWrap() {
    updateUserFullName(firstNameInputEl.value + " " + lastNameInputEl.value);
}
function updateAvatarSrcBackup() {
    avatarSrcBackup = avatarEl.src;
}
function updateBackgroundSrcBackup() {
    backgroundSrcBackup = backgroundEl.style.background.slice(5, -2);
}
