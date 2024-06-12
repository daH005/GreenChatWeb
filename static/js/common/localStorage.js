export class LocalStorageItemProxy {
    key;
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
        return Boolean(this.get());
    }
}
export var JWT = new LocalStorageItemProxy("JWT");
