import {randomIP, randomSuffix, ipToInt, intToIp} from "./ip.ts"
import {shuffle} from "./utils.ts"


function unmask(ip: string, prefix: number): string {
    const ipInt = ipToInt(ip);
    const mask = (0xffffffff << (32 - prefix)) >>> 0;
    const blockSize = 2 ** (32 - prefix);
    return ipInt & mask;
}

export function cidrChoices(ip: string, prefix: number) {
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
