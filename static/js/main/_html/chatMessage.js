import { dateToTimeStr }  from "../../_datetime.js";
import { makeHyperlinks, makeHighlights } from "../../_strTools.js";
import { AbstractChatElementFacade } from "./abs.js";

const chatMessageTempEl = document.getElementById("js-chat-message-temp");

export class ChatMessage extends AbstractChatElementFacade {

    get tempEl() {
        return chatMessageTempEl;
    }

    _makeEl() {
        super._makeEl();
        if (this.data.isSelf) {
            this.el.classList.add("chat__message--self");

            if (!this.data.fromApi.isRead) {
                this.el.classList.add("chat__message--unread");
            }

        }
    }

    _makeChildEls() {
        this.childEls.name = this.el.querySelector(".chat__message__name");
        this.childEls.name.textContent = this.data.fromApi.user.firstName;

        this.childEls.text = this.el.querySelector(".chat__message__text");
        this.childEls.text.textContent = this.data.fromApi.text;
        this.childEls.text.innerHTML = this._formattedTextMessageHtml(this.childEls.text.innerHTML);

        this.childEls.time = this.el.querySelector(".chat__message__time");
        this.childEls.time.textContent = this._timeStr();
    }

    _formattedTextMessageHtml(html) {
        html = makeHyperlinks(html);
        html = makeHighlights(html);
        return html;
    }

    _timeStr() {
        return dateToTimeStr(this.data.fromApi.creatingDatetime);
    }

}
