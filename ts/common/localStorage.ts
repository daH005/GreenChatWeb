export class LocalStorageItemProxy {
    protected key: string;

    public constructor(key: string) {
        this.key = key;
    }

    public get(): string {
        return localStorage.getItem(this.key);
    }

    public set(value: string): void {
        return localStorage.setItem(this.key, value);
    }

    public exist(): boolean {
        return Boolean(this.get());
    }

}

export var JWT: LocalStorageItemProxy = new LocalStorageItemProxy("JWT");
