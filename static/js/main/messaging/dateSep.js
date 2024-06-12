import { AbstractHTMLChatElementFacade } from "./abstractChatElement.js";
export class HTMLDateSep extends AbstractHTMLChatElementFacade {
    _dateStr;
    _thisElTemplateEl = document.getElementById("js-chat-date-sep-temp");
    constructor(parentEl, dateStr) {
        super(parentEl);
        this._dateStr = dateStr;
    }
    _initChildEls() {
        this._thisEl.textContent = this._dateStr;
    }
}
