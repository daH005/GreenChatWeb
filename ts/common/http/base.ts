import { redirectToLoginPage } from "../redirects.js";
import { getCookie } from "../cookies.js";
import { notify } from "../notification.js";
import { HTTP_API_URLS } from "./apiUrls.js";

interface FetchOptions {
    method: string,
    headers: Record<string, string>,
    body?: string | Blob,
    credentials: string,
}

interface RequestOptions {
    URL: string,
    METHOD: string,
    STATUSES_NOTIFICATIONS?: Record<number, string>,
    STATUSES_FUNCTIONS?: Record<number, Function>,
    RESPONSE_DATA_TYPE?: string,
    REQUEST_DATA_IS_JSON?: boolean,
}

export enum ResponseDataType {
    JSON = "json",
    BLOB = "blob",
}

export function makeRequestFunc<RequestDataInterface, ResponseDataInterface>(options: RequestOptions) {
    options = optionsWithDefaultValues(options);
    async function _request(data: RequestDataInterface): Promise<ResponseDataInterface> {
        return await request<RequestDataInterface, ResponseDataInterface>(options, data);
    }
    _request.options = options;  // saved for tests

    return _request
}

export function makeRequestFuncWithoutRequestData<ResponseDataInterface>(options: RequestOptions) {
    options = optionsWithDefaultValues(options);
    async function _request(): Promise<ResponseDataInterface> {
        return await request<null, ResponseDataInterface>(options, null);
    }
    _request.options = options;  // saved for tests

    return _request
}

function optionsWithDefaultValues(options: RequestOptions): RequestOptions {
    return {
        STATUSES_NOTIFICATIONS: {},
        STATUSES_FUNCTIONS: {},
        RESPONSE_DATA_TYPE: ResponseDataType.JSON,
        REQUEST_DATA_IS_JSON: true,
        ...options,
    }
}

async function request<RequestDataInterface, ResponseDataInterface>(options: RequestOptions, data: RequestDataInterface | null): Promise<ResponseDataInterface> {
    let [fetchUrl, fetchOptions] = makeRequestUrlAndOptions(options, data);

    let response = await fetch(fetchUrl, fetchOptions);

    if (response.status == 401) {
        let refreshAccessResponse = await fetch(HTTP_API_URLS.REFRESH_ACCESS, {
            method: "POST",
            headers: {
                "X-CSRF-TOKEN": getCookie("csrf_refresh_token"),
            },
            credentials: "include",
        });
        if (refreshAccessResponse.status == 401) {
            redirectToLoginPage();
        }

        return await request(options, data);
    }

    if (response.status in options.STATUSES_NOTIFICATIONS) {
        notify(options.STATUSES_NOTIFICATIONS[response.status]);
    }

    if (response.ok) {
        return await response[options.RESPONSE_DATA_TYPE]();
    }

    if (response.status in options.STATUSES_FUNCTIONS) {
        return options.STATUSES_FUNCTIONS[response.status]();
    }

    if (!(response.status in options.STATUSES_NOTIFICATIONS)) {
        console.log("Неизвестная ошибка...", response.status);
    }
    throw Error;
}

export function makeRequestUrlAndOptions(options: RequestOptions, data: Object | Blob | null=null): [string, Object] {
    let fetchUrl = options.URL;
    let fetchOptions: FetchOptions = {
        method: options.METHOD,
        headers: {},
        credentials: "include",
    }

    if (["POST", "PUT", "DELETE", "PATCH"].includes(options.METHOD)) {
        fetchOptions.headers = {
            ...fetchOptions.headers,
            "X-CSRF-TOKEN": getCookie("csrf_access_token"),
        }
    }

    if (options.REQUEST_DATA_IS_JSON) {
        fetchOptions.headers = {
            ...fetchOptions.headers,
            "Content-Type": "application/json",
        };
    }

    if (data) {
        if (options.METHOD == "GET") {
            // @ts-ignore
            let queryParamsStr = "?" + new URLSearchParams(data).toString();
            fetchUrl += queryParamsStr;
        } else if (options.REQUEST_DATA_IS_JSON) {
            fetchOptions.body = JSON.stringify(data);
        } else {
            fetchOptions.body = <Blob>data;
        }
    }

    return [fetchUrl, fetchOptions];
}
