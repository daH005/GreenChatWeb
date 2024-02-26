class LocalStorageItemFacade {

    constructor(key) {
        this.key = key;
    }

    get() {
        return localStorage.getItem(this.key);
    }

    set(value) {
        return localStorage.setItem(this.key, value);
    }

    exist() {
        return !(["undefined", "null", undefined, null].includes(this.get()));
    }

}

export var JWTToken = new LocalStorageItemFacade("JWTToken");
