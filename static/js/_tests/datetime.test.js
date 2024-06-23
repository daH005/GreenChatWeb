import { test, expect } from "vitest";

import { setNowDate, dateToTimeStr, dateToDateStr } from "../main/datetime.js";
import { DATES_AND_DATE_STRINGS, DATES_AND_TIME_STRINGS } from "./data/datetime.js";

setNowDate(() => {
    return new Date("2024-02-21T16:13:00");
});

test.each(DATES_AND_TIME_STRINGS)("positive test: `dateToTimeStr` function returns expected values", (date, expectedString) => {
    expect(dateToTimeStr(date)).toBe(expectedString);
});

test.each(DATES_AND_DATE_STRINGS)("positive test: `dateToDateStr` function returns expected values", (date, expectedString) => {
    expect(dateToDateStr(date)).toBe(expectedString);
});
