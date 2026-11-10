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

function randomIP(): string {
  // Uniform over 0 .. 2^32 - 1.
  const ip = Math.floor(Math.random() * 2 ** 32);
  return intToIp(ip)
}

function randomSuffix(): number {
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

function availableHosts(cidr: number): number {
  if (cidr < 0 || cidr > 32){ return NaN }
  if (cidr === 32) { return 1 }
  if (cidr === 31) { return 2 }
  return Math.pow(2, 32-cidr) - 2;
}

export {randomIP, randomSuffix, intToIp, ipToInt, availableHosts};
