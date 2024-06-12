const MONTHS_LABELS = {
    1: "янв",
    2: "фев",
    3: "мар",
    4: "апр",
    5: "мая",
    6: "июн",
    7: "июл",
    8: "авг",
    9: "сен",
    10: "окт",
    11: "ноя",
    12: "дек",
}

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
        timeStr += " (вчера)";
    } else {
        timeStr += " (" + dateToDateStr(date) + ")";
    }
    return timeStr;
}

export function dateToDateStr(date: Date): string {
    let nowDate_ = nowDate();
    if (nowDate_.toLocaleDateString() == date.toLocaleDateString()) {
        return "сегодня";
    }
    let yesterdayDate = nowDate();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    if (yesterdayDate.toLocaleDateString() == date.toLocaleDateString()) {
        return "вчера";
    }
    let dateStr = String(date.getDate()) + " " + MONTHS_LABELS[date.getMonth() + 1];
    if (nowDate_.getFullYear() != date.getFullYear()) {
        dateStr += " " + String(date.getFullYear());
    }
    return dateStr;
}
