import { Language } from "./enum.js";

const _KEY: string = "lang"

export function getLanguage(): Language {
    let language: Language | undefined = <Language>localStorage.getItem(_KEY);
    if (!language) {
        setLanguage(Language.RUSSIAN);
        language = Language.RUSSIAN;
    }
    return language;
}

export function setLanguage(language: Language): void {
    localStorage.setItem(_KEY, language);
}
