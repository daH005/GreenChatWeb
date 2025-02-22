import { APIMessage } from "../../common/apiDataInterfaces.js";
import { requestUser, requestMessages } from "../../common/http/functions.js";
import { thisUser } from "../../common/thisUser.js";
import { normalizeDateTimezone } from "../datetime.js";
import { AbstractHTMLTemplatedElement } from "./abstractTemplatedElement.js";
import { HTMLMessage, HTMLMessageFromThisUser } from "./messages.js";
import { AbstractHTMLChat } from "./abstractChat.js";

export class HTMLChatSection extends AbstractHTMLTemplatedElement {

    protected readonly _SIZE: number = 20;

    protected _templateEl = <HTMLTemplateElement>document.getElementById("js-chat-section-temp");
    protected _chat: AbstractHTMLChat;
    protected _all: HTMLChatSection[] = [];
    protected _commonMessageStorage: Record<number, HTMLMessage>;
    protected _topOffset: number;
    protected _topRequestedOffset: number;
    protected _bottomOffset: number;
    protected _bottomRequestedOffset: number;
    protected _topIsEnd: boolean = false;
    protected _bottomIsEnd: boolean = false;

    public constructor(chat: AbstractHTMLChat,
                       all: HTMLChatSection[],
                       parentEl: HTMLElement,
                       startOffset: number,
                       commonMessageStorage: Record<number, HTMLMessage>,
                       ) {
        super(parentEl);
        this._chat = chat;
        this._all = all;
        this._commonMessageStorage = commonMessageStorage;

        this._topOffset = startOffset - this._SIZE;
        if (this._topOffset < 0) {
            this._topOffset = 0;
        }
        this._topRequestedOffset = this._topOffset;

        this._bottomOffset = startOffset;
        this._bottomRequestedOffset = this._bottomOffset;
    }

    public init(): void {
        super.init(false);
        this._insertNewSection();
    }

    protected _insertNewSection(): void {
        let section: HTMLChatSection;
        let index: number;
        for (let i in this._all) {
            index = Number(i);
            section = this._all[index];
            if (this._bottomOffset >= section.topOffset) {
                section.insertSiblingBefore(this._el);
                this._all.splice(index, 0, this);
                return;
            }
        }
        this._all.push(this);
    }

    public get topOffset(): number {
        return this._topOffset;
    }

    public get bottomOffset(): number {
        return this._bottomOffset;
    }

    public insertSiblingBefore(el: HTMLElement): void {
        this._parentEl.insertBefore(el, this._el)
    }

    public async switch(): Promise<void> {
        this._chat.setTopSection(this);
        this._chat.setBottomSection(this);
        this._chat.hideSections();
        this.show();
        await this.loadNextTopMessages();
        await this.loadNextBottomMessages();
    }

    public show(): void {
        this._el.classList.remove("chat__section--hidden");
    }

    public hide(): void {
        this._el.classList.add("chat__section--hidden");
    }

    public async loadNextTopMessages(): Promise<void> {
        if (this._topOffset < this._topRequestedOffset) {
            return;
        }

        if (!this._topIsEnd) {
            this._topRequestedOffset += this._SIZE;
            let apiMessages: APIMessage[] = await this._requestMessages(this._topRequestedOffset);
            for (let apiMessage of apiMessages) {
                await this._addMessage(apiMessage, true);
                this._topOffset += 1;
            }
        }

        let topSibling: HTMLChatSection | null = this._all[this._currentIndex() - 1];
        if (!topSibling || topSibling.bottomOffset > this._topOffset) {
            return;
        }

        this._chat.setTopSection(topSibling);
        topSibling.show();
        this._topIsEnd = true;
    }

    public async loadNextBottomMessages(): Promise<void> {
        if (this._bottomOffset > this._bottomRequestedOffset) {
            return;
        }

        if (!this._bottomIsEnd) {
            this._bottomRequestedOffset -= this._SIZE;
            if (this._bottomRequestedOffset < 0) {
                this._bottomRequestedOffset = 0;
            }
            let apiMessages: APIMessage[] = await this._requestMessages(this._bottomRequestedOffset);
            apiMessages = apiMessages.reverse();
            for (let apiMessage of apiMessages) {
                await this._addMessage(apiMessage, false);
                this._bottomOffset -= 1;
            }

            if (this._bottomOffset < 0) {
                this._bottomOffset = 0;
            }
        }

        let bottomSibling: HTMLChatSection | null = this._all[this._currentIndex() + 1];
        if (!bottomSibling || bottomSibling.topOffset < this._bottomOffset) {
            return;
        }

        this._chat.setBottomSection(bottomSibling);
        bottomSibling.show();
        this._bottomIsEnd = true;
    }

    protected _currentIndex(): number {
        return this._all.indexOf(this);
    }

    protected async _requestMessages(offset: number): Promise<APIMessage[]> {
        return await requestMessages(this._chat.id, {
            offset,
            size: this._SIZE,
        });
    }

    protected async _addMessage(apiMessage: APIMessage, prepend: boolean): Promise<HTMLMessage> {
        if (this._commonMessageStorage[apiMessage.id]) {
            return;
        }

        let fromThisUser: boolean = thisUser.id == apiMessage.userId;
        let creatingDatetime: Date = new Date(apiMessage.creatingDatetime);
        normalizeDateTimezone(creatingDatetime);

        let messageType: typeof HTMLMessage;
        if (!fromThisUser) {
            messageType = HTMLMessage;
        } else {
            messageType = HTMLMessageFromThisUser;
        }
        let message: HTMLMessage = new messageType(
            this._chat,
            this,
            this._el,
            apiMessage.id,
            apiMessage.text,
            apiMessage.isRead,
            creatingDatetime,
            await requestUser(apiMessage.userId),
            apiMessage.hasFiles,
        );
        message.init(prepend);

        this._commonMessageStorage[message.id] = message;
        return message;
    }

    public increaseOffsets(): void {
        this._topOffset += 1;
        this._topRequestedOffset += 1;
        this._bottomOffset += 1;
        this._bottomRequestedOffset += 1;
    }

}

export class HTMLChatLastMessageSection extends HTMLChatSection {
    protected _bottomIsEnd = true;

    public async addMessage(apiMessage: APIMessage): Promise<HTMLMessage> {
        return await this._addMessage(apiMessage, false);
        this._increaseAllOffsets();
    }

    protected _increaseAllOffsets(): void {
        for (let section of this._all) {
            section.increaseOffsets();
        }
    }

    public override async loadNextBottomMessages(): Promise<void> {}

}
