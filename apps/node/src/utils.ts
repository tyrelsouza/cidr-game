export function shuffle(arr: number[]): number[] {
    return [...arr].sort(() => Math.random() - 0.5);
}
