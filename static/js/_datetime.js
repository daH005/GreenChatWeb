// Перечисление номеров месяцев и их кратких наименований.
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

// Устанавливает для объекта `Date` часовой пояс клиента.
export function normalizeDateTimezone(date) {
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
}

// Формирует из объекта `Date` строку формата '<часы>:<минуты>'.
// Если час или минута < 10, то в их начало добавляется 0.
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

// Формирует из объекта `Date` строку формата '<день> <краткое имя месяца>'.
// Если год переданной даты != текущему, то к вышеописанному результату конкатенируется ' <год>'.
// Также: если переданная дата - это сегодняшний день, то возвращается "сегодня",
// а если день вчерашний, то соответственно "вчера".
export function dateToDateStr(date) {
    let nowDate = new Date();
    if (nowDate.toLocaleDateString() == date.toLocaleDateString()) {
        return "сегодня";
    }
    let yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    if (yesterdayDate.toLocaleDateString() == date.toLocaleDateString()) {
        return "вчера";
    }
    let dateStr = String(date.getDate()) + " " + MONTHS_LABELS[date.getMonth() + 1];
    if (nowDate.getFullYear() != date.getFullYear()) {
        dateStr += " " + String(date.getFullYear());
    }
    return dateStr;
}
