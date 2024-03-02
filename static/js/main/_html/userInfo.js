const userIdParentEl = document.getElementById("js-user-id");
const userIdSpanEl = userIdParentEl.querySelector("span");
const userNameEl = document.getElementById("js-user-name");

userIdParentEl.onclick = () => {
    navigator.clipboard.writeText(userIdSpanEl.textContent);
    notify("ID успешно скопирован!");
}

export function updateUserInfo(user) {
    userIdSpanEl.textContent = user.id;
    userNameEl.textContent = user.firstName + " " + user.lastName;
}
