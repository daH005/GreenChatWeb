const userNameEl = document.getElementById("js-user-name");
const userIdParentEl = document.getElementById("js-user-id-parent");
const userIdEl = document.getElementById("js-user-id");

userIdParentEl.onclick = () => {
    navigator.clipboard.writeText(userIdEl.textContent);
    notify("ID успешно скопирован!");
}

export function updateUserInfo(user) {
    userNameEl.textContent = user.firstName + " " + user.lastName;
    userIdEl.textContent = user.id;
}
