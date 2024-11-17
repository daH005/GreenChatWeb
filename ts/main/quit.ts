import { redirectToLoginPage } from "../common/redirects.js";
import { requestToLogout } from "../common/http/functions.js";

const quitButton: HTMLButtonElement = <HTMLButtonElement>document.getElementById("quit");

quitButton.onclick = async () => {
    await requestToLogout();
    redirectToLoginPage();
}
