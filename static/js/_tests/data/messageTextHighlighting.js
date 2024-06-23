export const RAW_TEXTS_AND_TEXTS_WITH_HYPERLINKS = [
    ["any text. go to https://link.ru now!",
     "any text. go to <a href=\"https://link.ru\" target=\"_blank\">https://link.ru</a> now!"],
    ["http://localhost",
     "<a href=\"http://localhost\" target=\"_blank\">http://localhost</a>"],
    ["text without link",
     "text without link"],
];

export const RAW_TEXTS_AND_TEXTS_WITH_HIGHLIGHTS = [
    ["`anytext`",
     "<span class=\"highlighted-text\">anytext</span>"],
    ["`any text` hihi `anytext`",
     "<span class=\"highlighted-text\">any text</span> hihi <span class=\"highlighted-text\">anytext</span>"],
    ["anytext hihi ```",
     "anytext hihi ```"],
];