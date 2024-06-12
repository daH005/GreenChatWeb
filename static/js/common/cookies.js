export function getCookie(name) {
    let matches = document.cookie.match(new RegExp("(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"));
    return matches ? decodeURIComponent(matches[1]) : undefined;
}
export function setCookie(name, value, maxAge = 0) {
    document.cookie = name + "=" + value + "; " + "max-age=" + String(maxAge);
}
