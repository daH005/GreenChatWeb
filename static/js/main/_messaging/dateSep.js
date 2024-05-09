import { AbstractChatElementFacade } from "./abs.js";

const dateSepTempEl = document.getElementById("js-chat-date-sep-temp");

export class DateSep extends AbstractChatElementFacade {

    get tempEl() {
        return dateSepTempEl;
    }

    _makeEl() {
        super._makeEl();
        this.el.textContent = this.data.dateStr;
    }

}
