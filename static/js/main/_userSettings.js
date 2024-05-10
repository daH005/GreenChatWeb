import { user } from "./_user.js";

const SETTINGS_HIDDEN_CLASS = "sidebar__user-settings--hidden";
const settingsEl = document.getElementById("js-user-settings");

const settingsOpenButtonEl = document.getElementById("js-user-settings-opener");
settingsOpenButtonEl.onclick = () => {
    settingsEl.classList.toggle(SETTINGS_HIDDEN_CLASS);
}

const avatarImageEl = document.getElementById("js-user-settings-avatar");
const avatarInputEl = document.getElementById("js-user-settings-avatar-input");
const avatarButtonEl = document.getElementById("js-user-settings-avatar-button");

const userIdEl = document.getElementById("js-user-settings-id");
userIdEl.textContent = user.id;

const firstNameInputEl = document.getElementById("js-user-settings-first-name");
firstNameInputEl.value = user.firstName;

const lastNameInputEl = document.getElementById("js-user-settings-last-name");
lastNameInputEl.value = user.lastName;

const saveButtonEl = document.getElementById("js-user-settings-save");
const closeButtonEl = document.getElementById("js-user-settings-close");
closeButtonEl.onclick = () => {
    settingsEl.classList.add(SETTINGS_HIDDEN_CLASS);
}
