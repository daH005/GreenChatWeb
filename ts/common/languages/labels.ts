import { getLanguage } from "./storage.js";
import { Language } from "./enum.js";

interface Labels {
    error404: string,
    email: string,
    sendCode: string,
    code: string,
    loginOrRegistration: string,
    quit: string,
    loading: string,
    userId: string,
    avatar: string,
    firstName: string,
    lastName: string,
    background: string,
    selectChat: string,
    you: string,

    codeWasSent: string,
    codeSpam: string,
    invalidLogin: string,
    invalidUserId: string,
    successUpdate: string,
    largeAvatar: string,
    largeBackground: string,
    largeFiles: string,

    inputEmail: string,
    inputCode: string,
    invalidCode: string,

    idWasCopied: string,
    inputFirstName: string,
    inputLastName: string,

    months: Record<number, string>;
    yesterday: string,
    today: string,

    inputUserId: string,
    invalidSelfUserId: string,

    phrases: string[],
    files: string,
    typing: string,
}

export const RUSSIAN_LABELS: Labels = {
    error404: "Не знаем, как так вышло...",
    email: "Ваша почта",
    sendCode: "Код",
    code: "Код подтверждения",
    loginOrRegistration: "Вход & Регистрация",
    quit: "Выйти",
    loading: "Загрузка...",
    userId: "Введите ID...",
    avatar: "Сменить аватар",
    firstName: "Ваше имя",
    lastName: "Ваша фамилия",
    background: "Сменить фон",
    selectChat: "Выбрать чат",
    you: "Вы:",

    codeWasSent: "Код успешно отправлен!",
    codeSpam: "Вы не можете отправлять более одного кода в минуту!",
    invalidLogin: "Неверная почта либо код!",
    invalidUserId: "Пользователь с таким ID не найден!",
    successUpdate: "Данные успешно обновлены!",
    largeAvatar: "Вес аватарки слишком велик, бро!",
    largeBackground: "А фончик ничего себе весит-то! Полегче...",
    largeFiles: "Суммарный вес файлов слишком велик!",

    inputEmail: "Введите почту!",
    inputCode: "Введите код!",
    invalidCode: "Код подтверждения неверный!",

    idWasCopied: "ID успешно скопирован!",
    inputFirstName: "Введите имя!",
    inputLastName: "Введите фамилию!",

    months: {
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
    },
    yesterday: "вчера",
    today: "сегодня",

    inputUserId: "Введите нормальное число...",
    invalidSelfUserId: "Нельзя найти себя самого!",

    phrases: [
        "Что же написать...",
        "Хм...",
        "Короче, да...",
        "В общем и целом...",
        "Ваше слово?",
        "Впиши в меня текст!",
        "Наполни меня текстом!",
    ],
    files: "Файл(ы)",
    typing: "печатает...",
}

export const ENGLISH_LABELS: Labels = {
    error404: "We really don't know how it happened...",
    email: "Your email",
    sendCode: "Code",
    code: "Access code",
    loginOrRegistration: "Login & Registration",
    quit: "Quit",
    loading: "Loading...",
    userId: "Write a user ID...",
    avatar: "Change the avatar",
    firstName: "Your first name",
    lastName: "Your last name",
    background: "Change the background",
    selectChat: "Select a chat",
    you: "You:",

    codeWasSent: "The code has been sent!",
    codeSpam: "You can't send more than one code per minute!",
    invalidLogin: "The email or code is invalid!",
    invalidUserId: "A user with this ID was not found!",
    successUpdate: "The data has been updated!",
    largeAvatar: "The avatar size is very big!",
    largeBackground: "The background size is very big!",
    largeFiles: "The files size is very big!",

    inputEmail: "Write an email!",
    inputCode: "Write a code!",
    invalidCode: "The code is invalid!",

    idWasCopied: "The ID has been copied!",
    inputFirstName: "Write a first name!",
    inputLastName: "Write a last name!",

    months: {
        1: "jan",
        2: "feb",
        3: "mar",
        4: "apr",
        5: "may",
        6: "jun",
        7: "jul",
        8: "aug",
        9: "sep",
        10: "oct",
        11: "nov",
        12: "dec",
    },
    yesterday: "yesterday",
    today: "today",

    inputUserId: "Write a user ID...",
    invalidSelfUserId: "You can't find yourself!",

    phrases: [
        "What to write...",
        "Hm...",
        "A long story short...",
        "Well...",
        "I am...",
        "Write text in me!",
        "Fill me with text!",
    ],
    files: "File(s)",
    typing: "is typing..",
}

export const CURRENT_LABELS: Labels = {
    [Language.RUSSIAN]: RUSSIAN_LABELS,
    [Language.ENGLISH]: ENGLISH_LABELS,
}[getLanguage()];
