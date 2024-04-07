const userNameEl = document.getElementById("js-user-name");

export function updateUserInfo(user) {
    userNameEl.textContent = user.firstName + " " + user.lastName;
}
