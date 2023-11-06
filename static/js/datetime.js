const MONTHS_LABELS = {
    1: "января",
    2: "февраля",
    3: "марта",
    4: "апреля",
    5: "мая",
    6: "июня",
    7: "июля",
    8: "августа",
    9: "сентября",
    10: "октября",
    11: "ноября",
    12: "декабря",
}

export function dateToTimeStr(date) {
    let hours = date.getHours();
    let hoursStr = String(hours);
    if (hours < 10) {
        hoursString = "0" + hoursStr;
    }
    return hoursStr + ":" + String(date.getMinutes());
}

export function dateToDateStr(date) {
    let dateStr = String(date.getDay()) + " " + MONTHS_LABELS[dateStr.getMonth()];
    let nowDate = new Date();
    if (nowDate.getFullYear() != date.getFullYear()) {
        dateStr += " " + String(date.getFullYear());
    }
    return dateStr;
}
