const userNameEl = document.getElementById("js-user-name");
const userIdParentEl = document.getElementById("js-user-id-parent");
userIdParentEl.onclick = () => {
    navigator.clipboard.writeText(userIdEl.textContent);
    notify("ID успешно скопирован!");
}

const userIdEl = document.getElementById("js-user-id");

export function updateUserInfo(user) {
    updateUserFullName(user.firstName + " " + user.lastName);
    userIdEl.textContent = user.id;
}

export function updateUserFullName(fullName) {
    userNameEl.textContent = fullName;
}
