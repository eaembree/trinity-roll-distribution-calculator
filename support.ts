import { roundToTwo } from './lib';
import { DieValue, DiePoolRoll, TrialMetadata, TrialResult } from './types';

/**
 * Creates and empty {@link DiePoolRoll}
 * @returns 
 */
function emptyDiePoolRoll(): DiePoolRoll {
    return {
        1: 0, 2: 0, 3: 0, 4: 0, 5: 0,
        6: 0, 7: 0, 8: 0, 9: 0, 10: 0
    };
}

/**
 * Roll a ten sided die to generate a @see DieValue
 * @returns 
 */
 function rollD10(): DieValue {
    return Math.floor(Math.random() * 10) + 1 as DieValue;
}

/**
 * Combine a two {@link DiePoolRoll} objects into a new {@link DiePoolRoll}
 * @param first 
 * @param second 
 * @returns 
 */
function mergeDiePoolRolls(first: DiePoolRoll, second: DiePoolRoll): DiePoolRoll {
    const newSet = emptyDiePoolRoll();
    for (let v = 1; v <= 10; v += 1) {
        newSet[v] = first[v] + second[v];
    }
    return newSet;
}

/**
 * Generate a single roll of a pool of ten sided dice to create a {@link DiePoolRoll}
 * @param numDice 
 * @returns 
 */
 function generateDiePoolRoll(numDice: number): DiePoolRoll {
    if (typeof numDice !== 'number') throw Error('numDice must be a number');

    let totalRolls = emptyDiePoolRoll();


    while (numDice > 0) {
        const rolls = emptyDiePoolRoll();

        for (let n = 0; n < numDice; n += 1) {
            const num = rollD10();
            rolls[num] = rolls[num] + 1;
        }

        totalRolls = mergeDiePoolRolls(totalRolls, rolls);

        // Re-roll 10s
        numDice = rolls[10];
    }

    return totalRolls;
}

/**
 * Count the total number of die rolls in a {@link DiePoolRoll} which are successes
 * (i.e. have a value greater than or equal to the targetNumber)
 */
 function countSuccesses(targetNumber: number, rolls: DiePoolRoll): number {
    if (typeof targetNumber !== 'number') throw new Error('targetNumbers must be a number');
    if (targetNumber != Math.floor(targetNumber)) throw Error('targetNumber must be an integer');
    if (targetNumber < 1) return 0;

    let successes = 0;
    for (let n = targetNumber; n <= 10; n += 1) {
        successes += rolls[n];
    }
    return successes;
}

/**
 * Run a number of trials against a fixed target number for a number (pool) of
 * ten sided die. Returns counts and proportions of successes.
 * @param targetNumber 
 * @param numDice 
 * @param trials 
 * @returns 
 */
export function computeTrialResult(metadata: TrialMetadata): TrialResult {
    const { targetNumber, numDice, samples } = metadata;
    const successCounts: Record<number, number> = {};

    let successSamples = 0;
    let botchSamples = 0;
    for (let t = 0; t < samples; t += 1) {
        const rs = generateDiePoolRoll(numDice);
        const s = countSuccesses(targetNumber, rs);

        if (s > 0) successSamples++;
        if (s == 0 && rs[1] > 0) botchSamples++;

        if (s in successCounts) {
            successCounts[s] += 1;
        } else {
            successCounts[s] = 1;
        }
    }

    let failureSamples = samples - successSamples - botchSamples;

    return new TrialResult({
        targetNumber,
        numDice,
        samples,
        successCounts,
        successSamples,
        failureSamples,
        botchSamples
    });
}
