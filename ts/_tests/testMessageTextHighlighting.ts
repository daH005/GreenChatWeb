import { assert } from "./common.js";
import { makeHyperlinks, makeHighlights } from "../main/messageTextHighlighting.js";

function testPositiveMakeHyperLinks() {
    let data = [
        ["any text. go to https://link.ru now!",
         "any text. go to <a href=\"https://link.ru\" target=\"_blank\">https://link.ru</a> now!"],
        ["http://localhost",
         "<a href=\"http://localhost\" target=\"_blank\">http://localhost</a>"],
        ["text without link",
         "text without link"],
    ];
    for (let i in data) {
        assert(makeHyperlinks(data[i][0]) === data[i][1]);
    }
}
testPositiveMakeHyperLinks();

function testPositiveMakeHighlights() {
    let data = [
        ["`anytext`",
         "<span class=\"highlighted-text\">anytext</span>"],
        ["`any text` hihi `anytext`",
         "<span class=\"highlighted-text\">any text</span> hihi <span class=\"highlighted-text\">anytext</span>"],
        ["anytext hihi ```",
         "anytext hihi ```"],
    ];
    for (let i in data) {
        assert(makeHighlights(data[i][0]) === data[i][1]);
    }
}
testPositiveMakeHighlights();
