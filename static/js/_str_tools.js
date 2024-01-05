const LINK_REGEX = /(https?:\/\/\S+)/g;

export function makeHyperlinks(string) {
    return string.replace(LINK_REGEX, "<a href=\"$1\" target=\"_blank\">$1</a>");
}

