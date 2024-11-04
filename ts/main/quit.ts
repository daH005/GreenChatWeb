import { redirectToLoginPage } from "../common/redirects.js";

const quitButton: HTMLButtonElement = <HTMLButtonElement>document.getElementById("quit");

quitButton.onclick = () => {
    redirectToLoginPage();
}
