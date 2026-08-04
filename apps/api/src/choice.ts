function ipToInt(ip: string): number {
    return ip
        .split(".")
        .map(Number)
        .reduce((a, o) => (a << 8) | o, 0) >>> 0;
}

function intToIp(n: number): string {
    return [
        (n >>> 24) & 255,
        (n >>> 16) & 255,
        (n >>> 8) & 255,
        n & 255,
    ].join(".");
}

function shuffle<T>(arr: T[]): T[] {
    return [...arr].sort(() => Math.random() - 0.5);
}

export function randomIP(): string {
  const min = Math.ceil(0);
  const max = Math.floor(Math.pow(2, 32));
  const ip = Math.floor(Math.random() * (max - min + 1)) + min;
  return intToIp(ip)
}

export function randomSuffix(): number {
  const weighted = [
    // normal values (1x)
    1, 2, 3, 4, 5, 6, 7,
    9, 10, 11, 12, 13, 14, 15,
    17, 18, 19,
  
    // preferred values (2-4x)
    8, 8, 
    16, 16, 16, 16,
    20, 20, 20, 20,
    21, 21, 21, 21,
    22, 22, 22, 22,
    23, 23, 23, 23,
    24, 24, 24, 24,
    25, 25, 25, 25,
    26, 26, 26, 26,
    27, 27, 27, 27,
    28, 28, 28, 28,
    29, 29, 29, 29,
    30, 30, 30, 30,
    31, 31, 31, 31,
  ];

  return weighted[Math.floor(Math.random() * weighted.length)];
}

export function cidrChoices(ip: string, prefix: number) {
    const ipInt = ipToInt(ip);

    const mask = (0xffffffff << (32 - prefix)) >>> 0;
    const blockSize = 2 ** (32 - prefix);

    const network = ipInt & mask;

    const distractors = new Set<number>();

    // previous subnet
    if (network >= blockSize)
        distractors.add(network - blockSize);

    // next subnet
    if (network + blockSize <= 0xffffffff)
        distractors.add(network + blockSize);

    // start of /24
    distractors.add(network & 0xffffff00);

    // keep adding nearby blocks until we have 3
    let offset = 2;
    while (distractors.size < 3) {
        distractors.add(network + offset * blockSize);
        offset++;
    }
    
    /* TODO:Make the choices unique
    * 130.101.227.587/9 should NOT return 130.0.0.0 twice
    */

    const choices = shuffle([
        network,
        ...Array.from(distractors).slice(0, 3)
    ]);

    return {
        choices: choices.map(intToIp),
        answer: choices.indexOf(network),
    };
}
