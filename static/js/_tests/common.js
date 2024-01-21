export function assert(condition) {
    if (!condition) {
        throw "Assertion failed";
    }
}

// keys order is matter!
export function assertEqualsObjects(firstOb, secondOb) {
    assert(JSON.stringify(firstOb) === JSON.stringify(secondOb));
}
