import { user } from "./_user.js";
import { updateUserFullName } from "./_userInfo.js";
import { requestUserEditAvatar } from "../_http.js";

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

const avatarInputEl = document.getElementById("js-user-settings-avatar-input");
avatarInputEl.oninput = () => {
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
    if (avatarInputEl.files.length) {
        await requestUserEditAvatar(avatarInputEl.files[0]);

        avatarInputEl.value = "";
    }
}

const closeButtonEl = document.getElementById("js-user-settings-close");
closeButtonEl.onclick = () => {
    settingsEl.classList.add(SETTINGS_HIDDEN_CLASS);
}

function updateUserFullNameWrap() {
    updateUserFullName(firstNameInputEl.value + " " + lastNameInputEl.value);
}
