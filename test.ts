import { runTrial } from './support';

function printTrialResult(options: {
    dicePoolSizes: Array<number>,
    targetNumber: number,
    numSamples: number
}) {
    const { dicePoolSizes, targetNumber, numSamples } = options;

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

// 'Is a success' cutoff values
const targetNumbers = [7, 8]

// Number of dice in each die pools
const dicePoolSizes = [3, 4, 5, 6, 7, 8]

// Number of samples in each trial
const NUM_SAMPLES = 1000;

targetNumbers.forEach((tn) => printTrialResult(
    { dicePoolSizes, targetNumber: tn, numSamples: NUM_SAMPLES }
));


//printTrialResult({ dicePoolSizes, targetNumber: 8, numSamples: NUM_SAMPLES });

