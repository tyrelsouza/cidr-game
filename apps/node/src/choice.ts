import {ipToInt, intToIp} from "./ip.ts"
import {shuffle} from "./utils.ts"


function unmask(ip: string, prefix: number): number {
    const ipInt = ipToInt(ip);
    // JS masks shift counts to 5 bits, so `<< 32` would be `<< 0`; handle /0 explicitly.
    const mask = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
    // `&` yields a signed 32-bit result; `>>> 0` keeps it unsigned.
    return (ipInt & mask) >>> 0;
}

function cidrChoices(ip: string, prefix: number) {
    const network = unmask(ip, prefix);
    const blockSize = 2 ** (32 - prefix);

    // Nearest neighbouring subnets, alternating below and above (-1, +1, -2, +2, ...),
    // skipping any outside the address space so nothing wraps around.
    // Three steps each way is always enough to find 3, even at either edge; when fewer
    // networks exist (only 2 at /1) we return fewer choices.
    // The fixed bound also guarantees the loop ends, whatever `prefix` is.
    const distractors: number[] = [];
    for (let step = 1; step <= 3 && distractors.length < 3; step++) {
        for (const candidate of [network - step * blockSize, network + step * blockSize]) {
            if (candidate >= 0 && candidate <= 0xffffffff && distractors.length < 3) {
                distractors.push(candidate);
            }
        }
    }

    const choices = shuffle([network, ...distractors]);

    return {
        choices: choices.map(intToIp),
        answer: choices.indexOf(network),
    };
}

export {unmask, cidrChoices}
