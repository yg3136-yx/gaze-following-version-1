// The scene uses a 900 × 500 logical coordinate system. Keeping positions in
// model units makes the distance calculation independent from screen size.
export const PEOPLE = [
  { id: 1, x: 180, y: 220, color: "#2f6b73" }, // predefined starter
  { id: 2, x: 290, y: 220, color: "#965c45" }, // predefined starter
  { id: 3, x: 235, y: 320, color: "#526f9c" },
  { id: 4, x: 345, y: 320, color: "#7c5e8f" },
  { id: 5, x: 470, y: 320, color: "#ad7244" },
  { id: 6, x: 590, y: 280, color: "#47765f" },
  { id: 7, x: 95, y: 310, color: "#82703f" },
  { id: 8, x: 90, y: 435, color: "#536884" },
];

export const PROXIMITY_RADIUS = 130;
export const STARTER_INDICES = [0, 1];

export function distanceBetween(personA, personB) {
  return Math.hypot(personA.x - personB.x, personA.y - personB.y);
}

export function nearbyIndices(personIndex) {
  return PEOPLE.reduce((neighbors, person, otherIndex) => {
    if (
      personIndex !== otherIndex &&
      distanceBetween(PEOPLE[personIndex], person) <= PROXIMITY_RADIUS
    ) {
      neighbors.push(otherIndex);
    }
    return neighbors;
  }, []);
}

// Read from one unchanged snapshot, then return a new state. This guarantees
// that someone who changes this step cannot influence anyone until next step.
export function advanceOneStep(currentState, threshold) {
  const nextState = [...currentState];
  const changedIndices = [];

  currentState.forEach((isLookingUp, personIndex) => {
    if (isLookingUp) return;

    const lookingNeighbors = nearbyIndices(personIndex).filter(
      (neighborIndex) => currentState[neighborIndex],
    ).length;

    if (lookingNeighbors >= threshold) {
      nextState[personIndex] = true;
      changedIndices.push(personIndex);
    }
  });

  return { nextState, changedIndices };
}

export function makeInitialState() {
  return PEOPLE.map(() => false);
}

export function addStarters(state) {
  const nextState = [...state];
  STARTER_INDICES.forEach((index) => {
    nextState[index] = true;
  });
  return nextState;
}
