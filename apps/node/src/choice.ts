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

    const distractors = new Set<number>();

    // previous subnet
    if (network >= blockSize) {
        distractors.add(network - blockSize);
    }

    // next subnet
    if (network + blockSize <= 0xffffffff) {
        distractors.add(network + blockSize);
    }

    // start of /24
    //distractors.add(network & 0xffffff00);
    //console.log("c", distractors);

    // keep adding nearby blocks until we have 3
    let offset = 2;
    while (distractors.size < 3) {
        const next = network + offset * blockSize;
        if (next !== network) {
          distractors.add(next);
        }
        offset++;
    }
    
    const choices = shuffle([
        network,
        ...Array.from(distractors).slice(0, 3)
    ]);

    return {
        choices: choices.map(intToIp),
        answer: choices.indexOf(network),
    };
}

export {unmask, cidrChoices}
