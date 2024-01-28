const userIdEl = document.getElementById("js-user-id");
const userNameEl = document.getElementById("js-user-name");

export function updateUserInfo(user) {
    userIdEl.textContent = "ID: " + user.id;
    userNameEl.textContent = user.firstName;
}
