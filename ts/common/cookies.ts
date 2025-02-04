export function getCookie(name: string): string {
    let matches = document.cookie.match(new RegExp(
        "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
    ));
    return matches ? decodeURIComponent(matches[1]) : "";
}

export function setCookie(name: string, value: string, maxAge: number=0): void {
    document.cookie = name + "=" + value + "; " + "max-age=" + String(maxAge);
}
