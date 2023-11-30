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

// Формирует из объекта `Date` строку формата '<часы>:<минуты>'.
// Если час < 10, то в его начало добавляется 0.
export function dateToTimeStr(date) {
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
    return hoursStr + ":" + String(minutesStr);
}

// Формирует из объекта `Date` строку формата '<день> <месяц на русском и в родительном падеже>'. 
// Если год переданной даты != текущему, то к вышеописанному результату конкатенируется ' <год>'.
export function dateToDateStr(date) {
    let dateStr = String(date.getDay()) + " " + MONTHS_LABELS[date.getMonth()];
    let nowDate = new Date();
    if (nowDate.getFullYear() != date.getFullYear()) {
        dateStr += " " + String(date.getFullYear());
    }
    return dateStr;
}
