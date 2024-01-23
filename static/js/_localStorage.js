import { JWT_TOKEN_LOCAL_STORAGE_KEY } from "./_config.js";

export function JWTTokenExist() {
    return !(["undefined", "null", undefined, null].includes(getJWTToken()));
}

export function saveJWTToken(token) {
    localStorage.setItem(JWT_TOKEN_LOCAL_STORAGE_KEY, token);
}

export function getJWTToken() {
    return localStorage.getItem(JWT_TOKEN_LOCAL_STORAGE_KEY);  // may be strings - "undefined" / "null".
}

export function setGetJWTToken(newFunc) {
    getJWTToken = newFunc;
}
