import { redirectToLoginPage } from "../redirects.js";
import { getCookie } from "../cookies.js";
import { HTTP_API_URLS } from "./apiUrls.js";

export async function commonFetch(url, options): Promise<Response> {
    if (["POST", "PUT", "DELETE", "PATCH"].includes(options.method)) {
        options.headers = {
            "X-CSRF-TOKEN": getCookie("csrf_access_token"),
            ...options.headers,
        }
    }

    if (typeof options.body == "object") {
        options.headers = {
            "Content-Type": "application/json",
            ...options.headers,
        }
        options.body = JSON.stringify(options.body);
    }

    let response: Response = await fetch(url, {
        credentials: "include",
        ...options,
    });

    if (response.status != 401) {
        return response;
    }

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

    return await commonFetch(url, options);
}

export function makeUrlWithParams(url: string, params): string {
    if (!Object.keys(params).length) {
        return url;
    }
    return url + "?" + new URLSearchParams(params).toString();
}
