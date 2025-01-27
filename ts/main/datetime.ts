import { CURRENT_LABELS } from "../common/languages/labels.js";

const MONTHS_LABELS = CURRENT_LABELS.months;

export function nowDate(): Date {
    return new Date();
}

export function setNowDate(newFunc: Function): void {  // for tests
    // @ts-ignore
    nowDate = newFunc;
}

export function normalizeDateTimezone(date: Date): void {
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
}

export function dateToTimeStr(date: Date): string {
    let hours = date.getHours();
    let hoursStr = String(hours);
    if (hours < 10) {
        hoursStr = "0" + hoursStr;
    }
    let minutes = date.getMinutes()
    let minutesStr = String(minutes);
    if (minutes < 10) {
        minutesStr = "0" + minutesStr;
    }
    let timeStr = hoursStr + ":" + String(minutesStr);
    let nowDate_ = nowDate();
    if (nowDate_.toLocaleDateString() == date.toLocaleDateString()) {
        return timeStr;
    }

    let yesterdayDate = nowDate();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    if (yesterdayDate.toLocaleDateString() == date.toLocaleDateString()) {
        timeStr += ` (${CURRENT_LABELS.yesterday})`;
    } else {
        timeStr += " (" + dateToDateStr(date) + ")";
    }
    return timeStr;
}

export function dateToDateStr(date: Date): string {
    let nowDate_ = nowDate();
    if (nowDate_.toLocaleDateString() == date.toLocaleDateString()) {
        return CURRENT_LABELS.today;
    }
    let yesterdayDate = nowDate();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    if (yesterdayDate.toLocaleDateString() == date.toLocaleDateString()) {
        return CURRENT_LABELS.yesterday;
    }
    let dateStr = String(date.getDate()) + " " + MONTHS_LABELS[date.getMonth() + 1];
    if (nowDate_.getFullYear() != date.getFullYear()) {
        dateStr += " " + String(date.getFullYear());
    }
    return dateStr;
}
