function roundToTwo(num: number): number {
    return +(Math.round(parseFloat(num.toString() + "e+2"))  + "e-2");
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
function emptyRollSet(): DiePoolRoll {
    return {
        1: 0, 2: 0, 3: 0, 4: 0, 5: 0,
        6: 0, 7: 0, 8: 0, 9: 0, 10: 0
    };
}

/**
 * Roll a ten sided die to generate a @see DieValue
 * @returns 
 */
function rollDie(): DieValue {
    return Math.floor(Math.random() * 10) + 1 as DieValue;
}

/**
 * Combine a two {@link DiePoolRoll} objects into a new {@link DiePoolRoll}
 * @param first 
 * @param second 
 * @returns 
 */
function mergeDiePoolRolls(first: DiePoolRoll, second: DiePoolRoll): DiePoolRoll {
    const newSet = emptyRollSet();
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

    let totalRolls = emptyRollSet();


    while (numDice > 0) {
        const rolls = emptyRollSet();

        for (let n = 0; n < numDice; n += 1) {
            const num = rollDie();
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

type TrialsResult = {
    targetNumber: number,
    numDice: number,
    trials: number,
    successCounts: Record<number, number>,
    successAverage: number,
    successTrials: number,
    botchTrials: number,
    failureTrials: number,
    successRatio: number
    botchRatio: number
    failureRatio: number
}

/**
 * Run a number of trials against a fixed target number for a number (pool) of
 * ten sided die. Returns counts and proportions of successes.
 * @param targetNumber 
 * @param numDice 
 * @param trials 
 * @returns 
 */
function runTrials(trialsSample: TrialsSample): TrialsResult {
    const { targetNumber, numDice, trials } = trialsSample;
    const successCounts: Record<number, number> = {};

    let successTrials = 0;
    let botchTrials = 0;
    for (let t = 0; t < trials; t += 1) {
        const rs = generateDiePoolRoll(numDice);
        const s = countSuccesses(targetNumber, rs);

        if (s > 0) successTrials++;
        if (s == 0 && rs[1] > 0) botchTrials++;

        if (s in successCounts) {
            successCounts[s] += 1;
        } else {
            successCounts[s] = 1;
        }
    }

    let failureTrials = trials - successTrials - botchTrials;

    let successTotal = 0;
    Object.keys(successCounts).forEach((k) => {
        const kInt = parseInt(k);
        successTotal += (kInt * successCounts[k]);
    })

    return {
        targetNumber,
        numDice,
        trials,
        successCounts,
        successAverage: successTotal / trials,
        successTrials,
        botchTrials,
        failureTrials,
        successRatio: successTrials / trials,
        botchRatio: botchTrials / trials,
        failureRatio: failureTrials / trials
    };
}

type TrialsSample = {
    targetNumber: number,
    numDice: number,
    trials: number
}

function trialsArray(targetNumber: number, trials: number): Array<TrialsSample> {
    return [
        { targetNumber, numDice: 4, trials },
        { targetNumber, numDice: 5, trials },
        { targetNumber, numDice: 6, trials },
        { targetNumber, numDice: 7, trials },
        { targetNumber, numDice: 8, trials }
    ];
}

function printTrialResult(targetNumber: number, numTrials: number) {
    const trialsSamples = trialsArray(targetNumber, numTrials);
    const trialsResults = trialsSamples.map((t) => runTrials(t));
    console.table(
        trialsResults
            .map((o) => ({
                "# Trials": o.trials,
                "# Dice": o.numDice,
                "Target #": o.targetNumber,
                "Success %": roundToTwo(o.successRatio * 100),
                "Fail %": roundToTwo(o.failureRatio * 100),
                "Botch %": roundToTwo(o.botchRatio * 100),
                "Avg. Successes": roundToTwo(o.successAverage)
            })
            )
    );
}

const NUM_TRIALS = 1000;

printTrialResult(7, NUM_TRIALS);
printTrialResult(8, NUM_TRIALS);

