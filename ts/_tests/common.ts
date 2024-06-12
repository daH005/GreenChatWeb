export function throwAssertionError(): void {
    throw "Assertion failed";
}

export function assert(condition: boolean): void {
    if (!condition) {
        throwAssertionError();
    }
}

export function assertEqualsObjects(firstOb: Object, secondOb: Object) {
    for (let key in firstOb) {
        if (!(key in secondOb)) {
            throwAssertionError();
        }
        if (typeof firstOb[key] === "object") {
            assertEqualsObjects(firstOb[key], secondOb[key]);
        } else {
            assert(firstOb[key] === secondOb[key]);
        }
    }
}
