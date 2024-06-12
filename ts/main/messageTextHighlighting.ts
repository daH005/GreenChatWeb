const LINK_REGEX: RegExp = /(https?:\/\/\S+)/g;
const HIGHLIGHTING_REGEX: RegExp = /`([^`]+)`/g;

export function makeHyperlinks(string: string): string {
    return string.replace(LINK_REGEX, "<a href=\"$1\" target=\"_blank\">$1</a>");
}

export function makeHighlights(string: string): string {
    return string.replace(HIGHLIGHTING_REGEX, "<span class=\"highlighted-text\">$1</span>");
}
