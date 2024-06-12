export abstract class AbstractHTMLChatElementFacade {

    protected _parentEl: HTMLElement;
    protected _thisElTemplateEl: HTMLTemplateElement;
    protected _thisEl: HTMLElement;

    public constructor(parentEl: HTMLElement) {
        this._parentEl = parentEl;
    }

    public init(prepend: boolean=false): void {
        this._initThisEl(prepend);
        this._initChildEls();
    }

    protected _initThisEl(prepend: boolean): void {
        let node: Node = this._thisElTemplateEl.content.cloneNode(true);
        if (prepend) {
            this._parentEl.prepend(node);
            this._thisEl = <HTMLElement>this._parentEl.firstElementChild;
        } else {
            this._parentEl.append(node);
            this._thisEl = <HTMLElement>this._parentEl.lastElementChild;
        }
    }

    protected _initChildEls(): void {}

}
