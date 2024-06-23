import { test, expect } from "vitest";

import { JWT } from "../common/localStorage.js";
import { makeRequestUrlAndOptions } from "../common/http/base.js";
import { FUNCTIONS_ARGS_AND_FETCH_ARGS } from "./data/http.js";

JWT.get = () => {
    return "testToken";
};

test.each(FUNCTIONS_ARGS_AND_FETCH_ARGS)("positive test: `makeRequestUrlAndOptions` function returns expected data for `fetch`", (inputData, outputData) => {
    let [fetchUrl, fetchOptions] = makeRequestUrlAndOptions(inputData[0], inputData[1]);
    expect(fetchUrl).toBe(outputData[0]);
    expect(fetchOptions).toEqual(outputData[1]);
});
