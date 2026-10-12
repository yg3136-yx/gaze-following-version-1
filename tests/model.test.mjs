import assert from "node:assert/strict";
import {
  PEOPLE,
  addStarters,
  advanceOneStep,
  makeInitialState,
} from "../dist/model.mjs";

function runUntilStable(threshold) {
  let state = addStarters(makeInitialState());
  let steps = 0;

  while (steps < PEOPLE.length) {
    const result = advanceOneStep(state, threshold);
    if (result.changedIndices.length === 0) return { state, steps };
    state = result.nextState;
    steps += 1;
  }

  throw new Error("The model did not reach a stable state.");
}

const thresholdOne = runUntilStable(1);
const thresholdTwo = runUntilStable(2);

assert.equal(thresholdOne.state.filter(Boolean).length, 8);
assert.equal(thresholdTwo.state.filter(Boolean).length, 4);

// A simultaneous-update check: P4 does not join in the first threshold-2 step,
// even though P3 joins during that step. P4 can only respond next time.
const starters = addStarters(makeInitialState());
const firstStep = advanceOneStep(starters, 2);
assert.deepEqual(firstStep.changedIndices, [2]);
const secondStep = advanceOneStep(firstStep.nextState, 2);
assert.deepEqual(secondStep.changedIndices, [3]);

console.log("Model checks passed: threshold 1 → 8 people; threshold 2 → 4 people.");
