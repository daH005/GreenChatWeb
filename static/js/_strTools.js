const LINK_REGEX = /(https?:\/\/\S+)/g;
const HIGHLIGHTING_REGEX = /`([^`]+)`/g;

export function makeHyperlinks(string) {
    return string.replace(LINK_REGEX, "<a href=\"$1\" target=\"_blank\">$1</a>");
}

export function makeHighlights(string) {
    return string.replace(HIGHLIGHTING_REGEX, "<span class=\"highlighted-text\">$1</span>");
}
