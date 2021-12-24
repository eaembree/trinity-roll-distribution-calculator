import { roundToTwo } from './lib';

/**
 * A single value of a ten sided die
 */
export type DieValue = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

/**
 * A dictionary mapping a {@link DieRoll} value to the number of times
 * that value occurred.
 */
export type DiePoolRoll = Record<DieValue, number>

/**
* Data needed to generate a {@link TrialsResult}
*/
export type TrialMetadata = {
    targetNumber: number,
    numDice: number,
    samples: number
}

/**
 * Outcomes data for a trial generated from {@link TrialMetadata} input
 */
export class TrialResult {
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

    successesRatioTwoPlus: number;
    successesRatioThreePlus: number;
    successesRatioFourPlus: number;
    successesRatioFivePlus: number;

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

        this.successesRatioTwoPlus = this.proportionMinSuccesses(2);
        this.successesRatioThreePlus = this.proportionMinSuccesses(3);
        this.successesRatioFourPlus = this.proportionMinSuccesses(4);
        this.successesRatioFivePlus = this.proportionMinSuccesses(5);
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

    proportionMinSuccesses(minSuccesses: number): number {
        let totalSamples = 0;
        Object.keys(this.successCounts).forEach((k) => {
            const kInt = parseInt(k);
            if (kInt >= minSuccesses) {
                totalSamples += this.successCounts[k];
            }
        })

        return totalSamples / this.samples;
    }
}
