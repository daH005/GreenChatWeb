import { test, expect } from "vitest";

import { setFunctionOfGetCookieForTest } from "../common/cookies.js";
import { makeRequestUrlAndOptions } from "../common/http/base.js";
import { COMMON_COOKIE_VALUE, FUNCTIONS_ARGS_AND_FETCH_ARGS } from "./data/http.js";

setFunctionOfGetCookieForTest((key) => {
    return COMMON_COOKIE_VALUE;
});

test.each(FUNCTIONS_ARGS_AND_FETCH_ARGS)("positive test: `makeRequestUrlAndOptions` function returns expected data for `fetch`", (inputData, outputData) => {
    let [fetchUrl, fetchOptions] = makeRequestUrlAndOptions(inputData[0], inputData[1]);
    expect(fetchUrl).toBe(outputData[0]);
    expect(fetchOptions).toEqual(outputData[1]);
});
