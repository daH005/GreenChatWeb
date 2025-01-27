import { CURRENT_LABELS } from "./labels.js";

const _ATTR: string = "data-language";

document.querySelectorAll(`[${_ATTR}]`).forEach(el => {
    let key: string;
    let value: string;
    let items: string[] = el.getAttribute(_ATTR).split(";");
    for (let item of items) {
        [key, value] = item.split(":");
        el[key] = CURRENT_LABELS[value.trim()];
    }
});
