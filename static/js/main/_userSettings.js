import { user } from "./_user.js";
import { updateUserFullName } from "./_userInfo.js";
import { requestUserEditInfo, requestUserEditAvatar } from "../_http.js";
import { setInputAsInvalidAndMessageWithThrow, removeInvalidClassForAllInputs } from "../_common.js";

const SETTINGS_HIDDEN_CLASS = "sidebar__user-settings--hidden";
const settingsEl = document.getElementById("js-user-settings");

const settingsOpenButtonEl = document.getElementById("js-user-settings-open");
settingsOpenButtonEl.onclick = () => {
    settingsEl.classList.remove(SETTINGS_HIDDEN_CLASS);
}

const avatarLoadingImageEl = document.getElementById("js-user-avatar");
avatarLoadingImageEl.onclick = () => {
    avatarInputEl.click();
}

var avatarSrcBackup;
avatarLoadingImageEl.onload = () => {
    avatarSrcBackup = avatarLoadingImageEl.src;
    avatarLoadingImageEl.onload = () => {}
}

const avatarInputEl = document.getElementById("js-user-settings-avatar-input");
avatarInputEl.oninput = () => {
    avatarSrcBackup = avatarLoadingImageEl.src;

    let imageFileURL = URL.createObjectURL(avatarInputEl.files[0]);
    avatarLoadingImageEl.src = imageFileURL;
}

const firstNameInputEl = document.getElementById("js-user-settings-first-name");
firstNameInputEl.value = user.firstName;
firstNameInputEl.oninput = () => {
    updateUserFullNameWrap();
}

const lastNameInputEl = document.getElementById("js-user-settings-last-name");
lastNameInputEl.value = user.lastName;
lastNameInputEl.oninput = () => {
    updateUserFullNameWrap();
}

const saveButtonEl = document.getElementById("js-user-settings-save");
saveButtonEl.onclick = async () => {
    let updatingWas = false;

    if (avatarInputEl.files.length) {
        await requestUserEditAvatar(avatarInputEl.files[0]);
        avatarInputEl.value = "";
        updatingWas = true;
    }

    if (!firstNameInputEl.value) {
        setInputAsInvalidAndMessageWithThrow(firstNameInputEl, "Введите имя!");
    }

    if (!lastNameInputEl.value) {
        setInputAsInvalidAndMessageWithThrow(lastNameInputEl, "Введите фамилию!");
    }

    if (user.firstName != firstNameInputEl.value || user.lastName != lastNameInputEl.value) {
        user.firstName = firstNameInputEl.value;
        user.lastName = lastNameInputEl.value;

        await requestUserEditInfo({
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

const closeButtonEl = document.getElementById("js-user-settings-close");
closeButtonEl.onclick = () => {
    avatarLoadingImageEl.src = avatarSrcBackup;
    avatarInputEl.value = "";

    firstNameInputEl.value = user.firstName;
    lastNameInputEl.value = user.lastName;
    updateUserFullNameWrap();

    settingsEl.classList.add(SETTINGS_HIDDEN_CLASS);
}

function updateUserFullNameWrap() {
    updateUserFullName(firstNameInputEl.value + " " + lastNameInputEl.value);
}
