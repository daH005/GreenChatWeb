var _userInWindow: boolean = true;

export function userInWindow(): boolean {
    return _userInWindow;
}

window.addEventListener("focus", () => {
    _userInWindow = true;
});

window.addEventListener("blur", () => {
    _userInWindow = false;
});
