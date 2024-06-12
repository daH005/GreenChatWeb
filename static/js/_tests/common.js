export function throwAssertionError() {
    throw "Assertion failed";
}
export function assert(condition) {
    if (!condition) {
        throwAssertionError();
    }
}
export function assertEqualsObjects(firstOb, secondOb) {
    for (let key in firstOb) {
        if (!(key in secondOb)) {
            throwAssertionError();
        }
        if (typeof firstOb[key] === "object") {
            assertEqualsObjects(firstOb[key], secondOb[key]);
        }
        else {
            assert(firstOb[key] === secondOb[key]);
        }
    }
}
