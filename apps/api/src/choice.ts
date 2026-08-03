import { Choice } from "@cidr-game/shared"

function cidrChoices(prefix: number): Choice[] {
    const correct = (2 ** (32 - prefix)) - 2;

    return [
        {
            answer: correct + 2,
            reason: "Counted network and broadcast addresses as usable"
        },
        {
            answer: (2 ** (33 - prefix)) - 2,
            reason: "Used a prefix one bit smaller"
        },
        {
            answer: (2 ** (31 - prefix)) - 2,
            reason: "Used a prefix one bit larger"
        },
        {
            answer: correct + 1,
            reason: "Off-by-one calculation error"
        }
    ];
}
