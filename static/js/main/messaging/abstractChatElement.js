export class AbstractHTMLChatElementFacade {
    _parentEl;
    _thisElTemplateEl;
    _thisEl;
    constructor(parentEl) {
        this._parentEl = parentEl;
    }
    init(prepend = false) {
        this._initThisEl(prepend);
        this._initChildEls();
    }
    _initThisEl(prepend) {
        let node = this._thisElTemplateEl.content.cloneNode(true);
        if (prepend) {
            this._parentEl.prepend(node);
            this._thisEl = this._parentEl.firstElementChild;
        }
        else {
            this._parentEl.append(node);
            this._thisEl = this._parentEl.lastElementChild;
        }
    }
    _initChildEls() { }
}
