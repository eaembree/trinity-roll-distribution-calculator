import { computeTrialResult } from './support';
import { ratioToPercent } from './lib';

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

    const trialResults = trialMetadatas.map((t) => computeTrialResult(t));

    console.log(`TARGET NUMBER: ${targetNumber}   (results over ${numSamples} samples per dice pool size)`)
    console.table(
        trialResults
            .map((o) => ({
                "# Dice": o.numDice,
                "Avg. Successes": o.successAverage(),
                "Botch %": o.botchPercent(),
                "Fail %": o.failurePercent(),
                "1+ Success %": o.successPercent(),
                "2+ %": ratioToPercent(o.successesRatioTwoPlus),
                "3+ %": ratioToPercent(o.successesRatioThreePlus),
                "4+ %": ratioToPercent(o.successesRatioFourPlus),
                "5+ %": ratioToPercent(o.successesRatioFivePlus)
            }))
    );
}

// 'Is a success' cutoff values
const targetNumbers = [7, 8]

// Number of dice in each die pools
const dicePoolSizes = [3, 4, 5, 6, 7, 8]

// Number of samples in each trial
const NUM_SAMPLES = 1000;

targetNumbers.forEach((tn, index) => {
    printTrialResult(
        { dicePoolSizes, targetNumber: tn, numSamples: NUM_SAMPLES }
    )

    // Spacer between result sets
    console.log();
});
