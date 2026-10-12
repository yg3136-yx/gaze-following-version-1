import {
  PEOPLE,
  addStarters,
  advanceOneStep,
  makeInitialState,
} from "./model.mjs";

const STEP_DELAY_MS = 850;

const scene = document.querySelector("#scene");
const startButton = document.querySelector("#start-button");
const resetButton = document.querySelector("#reset-button");
const lookingCount = document.querySelector("#looking-count");
const status = document.querySelector("#status");
const thresholdInputs = [...document.querySelectorAll('input[name="threshold"]')];

let gazeState = makeInitialState();
let timerId = null;
let stepNumber = 0;

function personIllustration(person) {
  return `
    <svg viewBox="0 0 72 132" aria-hidden="true">
      <path class="gaze-ray" d="M45 28 L62 3" fill="none" stroke="#e9a23b" stroke-width="2.5" stroke-linecap="round" stroke-dasharray="3 5" />
      <g class="head-group">
        <circle cx="36" cy="30" r="17" fill="#efc8a4" stroke="#18202a" stroke-width="2.5" />
        <path d="M20 29 C20 7 53 8 53 28 C47 18 32 22 20 29Z" fill="#18202a" />
        <ellipse class="pupil" cx="43" cy="30" rx="2.4" ry="3.2" fill="#18202a" />
        <path d="M45 38 Q49 40 52 37" fill="none" stroke="#9c5e4a" stroke-width="1.5" stroke-linecap="round" />
      </g>
      <path d="M23 51 Q36 43 49 51 L55 97 L17 97Z" fill="${person.color}" stroke="#18202a" stroke-width="2.5" stroke-linejoin="round" />
      <path d="M22 58 L9 88 M50 58 L63 88" fill="none" stroke="#18202a" stroke-width="4" stroke-linecap="round" />
      <path d="M27 96 L23 128 M45 96 L49 128" fill="none" stroke="#18202a" stroke-width="5" stroke-linecap="round" />
    </svg>
    <span class="person-id">P${person.id}</span>
  `;
}

function buildScene() {
  PEOPLE.forEach((person, index) => {
    const figure = document.createElement("div");
    figure.className = "person";
    figure.dataset.personIndex = String(index);
    figure.style.left = `${(person.x / 900) * 100}%`;
    figure.style.top = `${(person.y / 500) * 100}%`;
    figure.innerHTML = personIllustration(person);
    scene.append(figure);
  });
}

function render(changedIndices = []) {
  const figures = [...document.querySelectorAll(".person")];

  figures.forEach((figure, index) => {
    figure.classList.toggle("is-looking-up", gazeState[index]);
    figure.classList.toggle("is-new", changedIndices.includes(index));
  });

  const totalLooking = gazeState.filter(Boolean).length;
  lookingCount.textContent = String(totalLooking);
  scene.setAttribute(
    "aria-label",
    `Eight people standing at different positions. ${totalLooking} are looking up.`,
  );
}

function selectedThreshold() {
  const checkedInput = thresholdInputs.find((input) => input.checked);
  return Number(checkedInput.value);
}

function finishSimulation() {
  timerId = null;
  startButton.disabled = true;
  status.textContent = `No more changes. The model stopped with ${gazeState.filter(Boolean).length} of 8 people looking up.`;
}

function runStep() {
  const { nextState, changedIndices } = advanceOneStep(gazeState, selectedThreshold());

  if (changedIndices.length === 0) {
    finishSimulation();
    return;
  }

  stepNumber += 1;
  gazeState = nextState;
  render(changedIndices);
  status.textContent = `Step ${stepNumber}: ${changedIndices.length} more ${changedIndices.length === 1 ? "person looks" : "people look"} up.`;
  timerId = window.setTimeout(runStep, STEP_DELAY_MS);
}

function startSimulation() {
  if (timerId !== null || gazeState.some(Boolean)) return;

  thresholdInputs.forEach((input) => {
    input.disabled = true;
  });
  startButton.disabled = true;

  gazeState = addStarters(gazeState);
  render([0, 1]);
  status.textContent = "Start: the two predefined people look up.";
  timerId = window.setTimeout(runStep, STEP_DELAY_MS);
}

function resetSimulation() {
  if (timerId !== null) window.clearTimeout(timerId);
  timerId = null;
  stepNumber = 0;
  gazeState = makeInitialState();
  thresholdInputs.forEach((input) => {
    input.disabled = false;
  });
  startButton.disabled = false;
  status.textContent = "Choose a threshold, then press Start.";
  render();
}

buildScene();
render();
startButton.addEventListener("click", startSimulation);
resetButton.addEventListener("click", resetSimulation);
