import { requestUserBackground } from "../common/http/functions.js";

let backgroundEl: HTMLElement = <HTMLElement>document.getElementById("js-background");

export async function updateBackground(): Promise<void> {
    let backgroundFile = await requestUserBackground();
    let backgroundFileUrl = URL.createObjectURL(backgroundFile);
    updateBackgroundUrl(backgroundFileUrl);

    backgroundEl.dispatchEvent(new Event("load"));  // because default `load` call before loading of the `background` style
}

export function updateBackgroundUrl(url: string): void {
    backgroundEl.style.background = `url(${url})`;
}
