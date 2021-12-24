/**
 * Take any number and round it to two decimal places.
 * Borrowed from https://www.delftstack.com/howto/javascript/javascript-round-to-2-decimal-places/#using-the-custom-function-to-round-a-number-to2-decimal-places-in-javascript
 * @param num 
 * @returns 
 */
export function roundToTwo(num: number): number {
    return +(Math.round(parseFloat(num.toString() + "e+2")) + "e-2");
}

/**
 * Convert a ratio to a percentage with two digit accuracy
 * @param r 
 * @returns 
 */
export function ratioToPercent(r: number) : number {
    return roundToTwo(r * 100);
}
