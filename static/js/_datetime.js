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

export function nowDate() {
    return new Date();
}

export function setNowDate(newFunc) {
    nowDate = newFunc;
}

export function normalizeDateTimezone(date) {
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
}

// Формирует из объекта `Date` строку формата '<часы>:<минуты>'.
// Если час или минута < 10, то в их начало добавляется 0.
// Также если переданная дата - не сегодняшний день, то добавляется подстрока ' (<день> <краткое имя месяца>)' / ' (вчера)'.
// Функция используется для элементов сообщений.
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

// Формирует из объекта `Date` строку формата '<день> <краткое имя месяца>'.
// Если год переданной даты != текущему, то к вышеописанному результату конкатенируется ' <год>'.
// Также: если переданная дата - это сегодняшний день, то возвращается "сегодня",
// а если день вчерашний, то соответственно "вчера".
// Функция используется для выставления дат в боковой панели, а также в разделительных чертах.
export function dateToDateStr(date) {
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
