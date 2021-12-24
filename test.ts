/**ake 
 * Take any number and round it to two decimal places.
 * Borrowed from https://www.delftstack.com/howto/javascript/javascript-round-to-2-decimal-places/#using-the-custom-function-to-round-a-number-to2-decimal-places-in-javascript
 * @param num 
 * @returns 
 */
function roundToTwo(num: number): number {
    return +(Math.round(parseFloat(num.toString() + "e+2")) + "e-2");
}

/**
 * A single value of a ten sided die
 */
type DieValue = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

/**
 * A dictionary mapping a {@link DieRoll} value to the number of times
 * that value occurred.
 */
type DiePoolRoll = Record<DieValue, number>

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
 * Data needed to generate a {@link TrialsResult}
 */
type TrialMetadata = {
    targetNumber: number,
    numDice: number,
    samples: number
}

/**
 * Outcomes data for a trial generated from {@link TrialMetadata} input
 */
class TrialsResult {
    targetNumber: number;
    numDice: number;
    samples: number;
    successCounts: Record<number, number>;

    successSamples: number;
    botchSamples: number;
    failureSamples: number;

    successRatio: number;
    botchRatio: number;
    failureRatio: number;

    /**
     *
     */
    constructor(
        data: {
            targetNumber: number,
            numDice: number,
            samples: number,
            successCounts: Record<number, number>,
            successSamples: number,
            failureSamples: number,
            botchSamples: number
        }
    ) {
        this.targetNumber = data.targetNumber;
        this.numDice = data.numDice;
        this.samples = data.samples;
        this.successCounts = data.successCounts;
        this.successSamples = data.successSamples;
        this.failureSamples = data.failureSamples;
        this.botchSamples = data.botchSamples;

        this.successRatio = this.successSamples / this.samples;
        this.botchRatio = this.botchSamples / this.samples;
        this.failureRatio = this.failureSamples / this.samples;
    }

    successPercent(): number {
        return roundToTwo(this.successRatio * 100);
    }

    failurePercent(): number {
        return roundToTwo(this.failureRatio * 100);
    }

    botchPercent(): number {
        return roundToTwo(this.botchRatio * 100);
    }

    successAverage(): number {
        let successTotal = 0;
        Object.keys(this.successCounts).forEach((k) => {
            const kInt = parseInt(k);
            successTotal += (kInt * this.successCounts[k]);
        })

        return roundToTwo(successTotal / this.samples);
    }
}

/**
 * Run a number of trials against a fixed target number for a number (pool) of
 * ten sided die. Returns counts and proportions of successes.
 * @param targetNumber 
 * @param numDice 
 * @param trials 
 * @returns 
 */
function runTrial(trialsSample: TrialMetadata): TrialsResult {
    const { targetNumber, numDice, samples } = trialsSample;
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

    let successTotal = 0;
    Object.keys(successCounts).forEach((k) => {
        const kInt = parseInt(k);
        successTotal += (kInt * successCounts[k]);
    })

    return new TrialsResult({
        targetNumber,
        numDice,
        samples,
        successCounts,
        successSamples,
        failureSamples,
        botchSamples
    });
}

function trialArray(targetNumber: number, samples: number): Array<TrialMetadata> {
    return [
        { targetNumber, numDice: 4, samples },
        { targetNumber, numDice: 5, samples },
        { targetNumber, numDice: 6, samples },
        { targetNumber, numDice: 7, samples },
        { targetNumber, numDice: 8, samples }
    ];
}

function printTrialResult(targetNumber: number, numSamples: number) {
    // Number of dice in each die pools
    const dicePoolSizes = [4, 5, 6, 7, 8]

    const trialMetadatas = dicePoolSizes.map((n) => ({
        targetNumber,
        numDice: n,
        samples: numSamples
    }));

    const trialResults = trialMetadatas.map((t) => runTrial(t));

    console.table(
        trialResults
            .map((o) => ({
                "# Samples": o.samples,
                "# Dice": o.numDice,
                "Target #": o.targetNumber,
                "Success %": o.successPercent(),
                "Fail %": o.failurePercent(),
                "Botch %": o.botchPercent(),
                "Avg. Successes": o.successAverage()
            }))
    );
}

const NUM_TRIALS = 1000;

printTrialResult(7, NUM_TRIALS);
printTrialResult(8, NUM_TRIALS);

