import { APIMessage } from "../../common/apiDataInterfaces.js";
import { requestUser, requestMessages } from "../../common/http/functions.js";
import { thisUser } from "../../common/thisUser.js";
import { normalizeDateTimezone } from "../datetime.js";
import { AbstractHTMLTemplatedElement } from "./abstractTemplatedElement.js";
import { HTMLMessage, HTMLMessageFromThisUser } from "./messages.js";
import { AbstractHTMLChat } from "./abstractChat.js";

export class HTMLChatSection extends AbstractHTMLTemplatedElement {

    protected readonly _DEFAULT_SIZE: number = 20;

    protected _templateEl = <HTMLTemplateElement>document.getElementById("js-chat-section-temp");
    protected _chat: AbstractHTMLChat;
    protected _all: HTMLChatSection[];
    protected _topCurrentOffset: number;
    protected _topNextOffset: number;
    protected _bottomCurrentOffset: number;
    protected _bottomNextOffset: number;
    protected _topIsEnded: boolean = false;
    protected _bottomIsEnded: boolean = false;
    protected _initialLoadingWas: boolean = false;

    public constructor(chat: AbstractHTMLChat,
                       all: HTMLChatSection[],
                       parentEl: HTMLElement,
                       startOffset: number,
                       ) {
        super(parentEl);
        this._chat = chat;
        this._all = all;

        this._topCurrentOffset = startOffset;
        this._topNextOffset = startOffset;

        // May be negative, this is normal behavior.
        this._bottomCurrentOffset = startOffset - this._DEFAULT_SIZE;
        this._bottomNextOffset = this._bottomCurrentOffset;
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
            if (this._topCurrentOffset >= section.topCurrentOffset) {
                section.insertSiblingBefore(this._el);
                this._all.splice(index, 0, this);
                return;
            }
        }
        this._all.push(this);
    }

    public get topCurrentOffset(): number {
        return this._topCurrentOffset;
    }

    // You have to add `this._DEFAULT_SIZE` to check the collision correctly.
    public get bottomCurrentOffset(): number {
        return this._bottomCurrentOffset;
    }

    public get topIsEnded(): boolean {
        return this._topIsEnded;
    }

    public get bottomIsEnded(): boolean {
        return this._bottomIsEnded;
    }

    public insertSiblingBefore(el: HTMLElement): void {
        this._parentEl.insertBefore(el, this._el)
    }

    public async switch(): Promise<void> {
        this._chat.setTopSection(this);
        this._chat.setBottomSection(this);
        this._chat.hideSections();
        this.show();

        if (!this._initialLoadingWas) {
            await this.loadNextTopMessages();
            await this.loadNextBottomMessages();
            this._initialLoadingWas = true;
            return;
        }

        let topSibling: HTMLChatSection | null = this._getTopSibling();
        if (topSibling && this._topIsEnded) {
            topSibling.show();
        }

        let bottomSibling: HTMLChatSection | null = this._getBottomSibling();
        if (bottomSibling && this._bottomIsEnded) {
            bottomSibling.show();
        }

    }

    public show(): void {
        this._el.classList.remove("chat__section--hidden");
    }

    public hide(): void {
        this._el.classList.add("chat__section--hidden");
    }

    public async loadNextTopMessages(): Promise<void> {
        if (!this._topIsEnded && this._topCurrentOffset >= this._topNextOffset) {
            this._topNextOffset += this._DEFAULT_SIZE;
            let apiMessages: APIMessage[] = await this._requestMessages(this._topCurrentOffset);
            for (let apiMessage of apiMessages) {
                await this._addMessage(apiMessage, true);
                this._topCurrentOffset += 1;
            }
        }

        let topSibling: HTMLChatSection | null = this._getTopSibling();
        if (!topSibling) {
            return;
        }

        if (topSibling.bottomCurrentOffset + this._DEFAULT_SIZE <= this._topCurrentOffset) {
            this._chat.setTopSection(topSibling);
            topSibling.show();
            topSibling.setBottomAsEnded();
            this.setTopAsEnded();
        }
    }

    public async loadNextBottomMessages(): Promise<void> {
        if (!this._bottomIsEnded && this._bottomCurrentOffset <= this._bottomNextOffset) {
            this._bottomNextOffset -= this._DEFAULT_SIZE;
            let apiMessages: APIMessage[] = await this._requestMessages(this._bottomCurrentOffset);
            apiMessages = apiMessages.reverse();
            for (let apiMessage of apiMessages) {
                await this._addMessage(apiMessage, false);
                this._bottomCurrentOffset -= 1;
            }
        }

        let bottomSibling: HTMLChatSection | null = this._getBottomSibling();
        if (!bottomSibling) {
            return;
        }

        if (bottomSibling.topCurrentOffset >= this._bottomCurrentOffset + this._DEFAULT_SIZE) {
            this._chat.setBottomSection(bottomSibling);
            bottomSibling.show();
            bottomSibling.setTopAsEnded();
            this.setBottomAsEnded();
        }
    }

    protected _currentIndex(): number {
        return this._all.indexOf(this);
    }

    protected async _requestMessages(offset: number, size: number | null = null): Promise<APIMessage[]> {
        if (size == null) {
            size = this._DEFAULT_SIZE;
        }
        if (offset < 0) {
            offset = 0;
        }
        return await requestMessages(this._chat.id, {
            offset, size,
        });
    }

    protected async _addMessage(apiMessage: APIMessage, prepend: boolean): Promise<HTMLMessage> {
        let alreadyExistedMessage: HTMLMessage | null = HTMLMessage.byId(apiMessage.id);
        if (alreadyExistedMessage) {
            return alreadyExistedMessage;
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
        );
        message.init(prepend);
        if (apiMessage.hasFiles) {
            await message.resetFiles();
        }

        this._chat.addMessageId(apiMessage.id);
        return message;
    }

    protected _getTopSibling(): HTMLChatSection | null {
        return this._all[this._currentIndex() - 1];
    }

    protected _getBottomSibling(): HTMLChatSection | null {
        return this._all[this._currentIndex() + 1];
    }

    public setTopAsEnded(): void {
        this._topIsEnded = true;
    }

    public setBottomAsEnded(): void {
        this._bottomIsEnded = true;
    }

    public increaseOffsets(): void {
        this._topCurrentOffset += 1;
        this._topNextOffset += 1;
        this._bottomCurrentOffset += 1;
        this._bottomNextOffset += 1;
    }

    public decreaseOffsets(): void {
        this._topCurrentOffset -= 1;
        this._topNextOffset -= 1;
        this._bottomCurrentOffset -= 1;
        this._bottomNextOffset -= 1;
    }

}

export class HTMLChatLastMessageSection extends HTMLChatSection {
    protected _bottomIsEnded = true;

    public async loadLastBottomMessage(): Promise<HTMLMessage | null> {
        let apiMessages: APIMessage[] = await this._requestMessages(0, 1);
        if (!apiMessages.length) {
            return null;
        }
        let message: HTMLMessage = await this._addMessage(apiMessages[0], false);
        return message;
    }

    public override async loadNextBottomMessages(): Promise<void> {}

}
