var _userInWindow = true;

export function userInWindow() {
    return _userInWindow;
}

window.addEventListener("focus", () => {
    _userInWindow = true;
});

window.addEventListener("blur", () => {
    _userInWindow = false;
});
