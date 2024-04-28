const userNameEl = document.getElementById("js-user-name");
const userIdEl = document.getElementById("js-user-id");

export function updateUserInfo(user) {
    userNameEl.textContent = user.firstName + " " + user.lastName;
    userIdEl.textContent = user.id;
}
