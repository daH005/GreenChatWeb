export function choose<T>(choices: T[]): T {
    let index = Math.floor(Math.random() * choices.length);
    return choices[index];
}
