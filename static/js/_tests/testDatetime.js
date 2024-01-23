import { assert } from "./common.js";
import { setNowDate, dateToTimeStr, dateToDateStr } from "../_datetime.js";

setNowDate(() => {
    return new Date("2024-02-21T16:13:00");
});

function testPositiveDateToTimeStr() {
    let data = [
        ["2024-02-21T16:10:30",
         "16:10"],
        ["2024-02-20T16:30:30",
         "16:30 (вчера)"],
        ["2024-01-21T16:30:30",
         "16:30 (21 янв)"],
        ["2023-01-21T16:30:30",
         "16:30 (21 янв 2023)"],
    ];
    for (let i in data) {
        data[i][0] = new Date(data[i][0]);
        assert(dateToTimeStr(data[i][0]) === data[i][1]);
    }
}
testPositiveDateToTimeStr();

function testPositiveDateToDateStr() {
    let data = [
        ["2024-02-21T16:10:30",
         "сегодня"],
        ["2024-02-20T16:30:30",
         "вчера"],
        ["2024-01-21T16:30:30",
         "21 янв"],
        ["2023-01-21T16:30:30",
         "21 янв 2023"],
    ];
    for (let i in data) {
        data[i][0] = new Date(data[i][0]);
        assert(dateToDateStr(data[i][0]) === data[i][1]);
    }
}
testPositiveDateToDateStr();
