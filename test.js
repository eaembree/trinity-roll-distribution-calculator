function emptyRollSet() {
    return {
        1: 0, 2: 0, 3: 0, 4: 0, 5: 0,
        6: 0, 7: 0, 8: 0, 9: 0, 10: 0
    };
}

function dieRoll() {
    return Math.floor(Math.random() * 10) + 1;
}

function mergeRollsLeft(left, right) {
    for (let v = 1; v <= 10; v += 1) {
        left[v] = left[v] + right[v];
    }
}

function generateRolls(numDice) {
    if (typeof numDice !== 'number') throw Error('numDice must be a number');

    const totalRolls = emptyRollSet();


    while (numDice > 0) {
        const rolls = emptyRollSet();

        for (let n = 0; n < numDice; n += 1) {
            const num = dieRoll();
            rolls[num] = rolls[num] + 1;
        }

        mergeRollsLeft(totalRolls, rolls);

        // Re-roll 10s
        numDice = rolls[10];
    }

    return totalRolls;
}

function countSuccesses(targetNumber, rolls) {
    if (typeof targetNumber !== 'number') throw new Error('targetNumbers must be a number');
    if (targetNumber != Math.floor(targetNumber)) throw Error('targetNumber must be an integer');
    if (targetNumber < 1) return 0;

    let successes = 0;
    for (let n = targetNumber; n <= 10; n += 1) {
        successes += rolls[n];
    }
    return successes;
}

function runTest(targetNumber, numDice, trials = 100) {
    const successCounts = {};

    let successTrials = 0;
    let botchTrials = 0;
    for (let t = 0; t < trials; t += 1) {
        const rs = generateRolls(numDice);
        const s = countSuccesses(targetNumber, rs);

        if(s > 0) successTrials++;
        if(s == 0 && rs[1] > 0) botchTrials++;

        if (s in successCounts) {
            successCounts[s] += 1;
        } else {
            successCounts[s] = 1;
        }
    }

    let failureTrials = trials - successTrials - botchTrials;

    return {
        targetNumber,
        numDice,
        trials,
        //successCounts,
        successTrials,
        botchTrials,
        failureTrials,
        successRatio: successTrials / trials,
        botchRatio: botchTrials / trials,
        failureRatio : failureTrials / trials
    };
}

console.log(runTest(8, 6, 1000));