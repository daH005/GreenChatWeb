import { notify } from "../notification.js";
export var ResponseDataType;
(function (ResponseDataType) {
    ResponseDataType["JSON"] = "json";
    ResponseDataType["BLOB"] = "blob";
})(ResponseDataType || (ResponseDataType = {}));
export function makeRequestFunc(options) {
    options = optionsWithDefaultValues(options);
    async function _request(data) {
        return await request(options, data);
    }
    _request.options = options; // saved for tests
    return _request;
}
export function makeRequestFuncWithoutRequestData(options) {
    options = optionsWithDefaultValues(options);
    async function _request() {
        return await request(options, null);
    }
    _request.options = options; // saved for tests
    return _request;
}
function optionsWithDefaultValues(options) {
    return {
        STATUSES_NOTIFICATIONS: {},
        STATUSES_FUNCTIONS: {},
        RESPONSE_DATA_TYPE: ResponseDataType.JSON,
        REQUEST_DATA_IS_JSON: true,
        ...options,
    };
}
async function request(options, data) {
    let [fetchUrl, fetchOptions] = makeRequestUrlAndOptions(options, data);
    let response = await fetch(fetchUrl, fetchOptions);
    if (response.status in options.STATUSES_NOTIFICATIONS) {
        notify(options.STATUSES_NOTIFICATIONS[response.status]);
    }
    if (response.ok) {
        return await response[options.RESPONSE_DATA_TYPE]();
    }
    else if (response.status in options.STATUSES_FUNCTIONS) {
        return options.STATUSES_FUNCTIONS[response.status]();
    }
    else if (!(response.status in options.STATUSES_NOTIFICATIONS)) {
        console.log("Неизвестная ошибка...", response.status);
    }
    throw Error;
}
export function makeRequestUrlAndOptions(options, data = null) {
    let fetchUrl = options.URL;
    let fetchOptions = {
        method: options.METHOD,
        headers: {},
        credentials: "include",
    };
    if (options.REQUEST_DATA_IS_JSON) {
        fetchOptions.headers = {
            "Content-Type": "application/json",
        };
    }
    if (data) {
        if (options.METHOD == "GET") {
            // @ts-ignore
            let queryParamsStr = "?" + new URLSearchParams(data).toString();
            fetchUrl += queryParamsStr;
        }
        else if (options.REQUEST_DATA_IS_JSON) {
            fetchOptions.body = JSON.stringify(data);
        }
        else {
            fetchOptions.body = data;
        }
    }
    return [fetchUrl, fetchOptions];
}
