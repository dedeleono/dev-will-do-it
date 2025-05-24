export function getTokensOut(
    reserveIn: number,
    tokensSold: number,
    a: number,
    b: number
) {
    if (reserveIn === 0) return 0;
    const firstTerm = (reserveIn * b) / a;
    const secondTerm = Math.exp(b * tokensSold);
    const finalSupply = Math.log(firstTerm + secondTerm) / b;
    return finalSupply - tokensSold;
}

export function getReserveOut(
    tokensIn: number,
    tokensSold: number,
    a: number,
    b: number
) {
    return (
        ((Math.exp(b * tokensSold) - Math.exp(b * (tokensSold - tokensIn))) *
            a) /
        b
    );
}

export function getPrice(tokenSupply: number, a: number, b: number) {
    if (tokenSupply === 0) return 0;
    return a * Math.exp(b * tokenSupply);
}
