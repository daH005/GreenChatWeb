export class AbstractChatElementFacade {

    constructor(args=null) {
        if (!args) {
            args = {};
        }

        if (args.parentEl) {
            this.parentEl = args.parentEl;
        }
        this.prepend = args.prepend || false;
        this.data = args.data || null;
        this._init(args);

        this.el = null;
        this._makeEl();

        this.childEls = {};
        this._makeChildEls();
    }

    _init() {}

    get parentEl() {
        return this._parentEl;
    }

    set parentEl(value) {
        this._parentEl = value;
    }

    get tempEl() {}  // Must be implemented

    _makeEl() {
        let node = this.tempEl.content.cloneNode(true);
        if (this.prepend) {
            this.parentEl.prepend(node);
            this.el = this.parentEl.firstElementChild;
        } else {
            this.parentEl.append(node);
            this.el = this.parentEl.lastElementChild;
        }
    }

    _makeChildEls() {}

}
