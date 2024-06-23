import { test, expect } from "vitest";

import { makeHyperlinks, makeHighlights } from "../main/messageTextHighlighting.js";
import { RAW_TEXTS_AND_TEXTS_WITH_HYPERLINKS, RAW_TEXTS_AND_TEXTS_WITH_HIGHLIGHTS } from "./data/messageTextHighlighting.js";

test.each(RAW_TEXTS_AND_TEXTS_WITH_HYPERLINKS)("positive test: `makeHyperlinks` function returns expected HTML", (rawText, expectedHTML) => {
    expect(makeHyperlinks(rawText)).toBe(expectedHTML);
});

test.each(RAW_TEXTS_AND_TEXTS_WITH_HIGHLIGHTS)("positive test: `makeHighlights` function returns expected HTML", (rawText, expectedHTML) => {
    expect(makeHighlights(rawText)).toBe(expectedHTML);
});
