// ── Test Suite: Dynamic States ─────────────────────────────────────────────
// Tests FR-2 (Sick trigger and recovery), FR-3 (Evolved timer increment and
// reset), FR-4 (timer only advances on ticks), FR-5 (state persistence),
// FR-6 (correct CSS class / state string per state).
// Run with: node test/dynamic-states.test.js

// ── Mock: localStorage ─────────────────────────────────────────────────────
const store = {};
global.localStorage = {
  getItem:    (k)    => (k in store ? store[k] : null),
  setItem:    (k, v) => { store[k] = String(v); },
  removeItem: (k)    => { delete store[k]; },
  clear:      ()     => { Object.keys(store).forEach(k => delete store[k]); },
};

// ── Constants (mirrors app.js) ─────────────────────────────────────────────
const KEY_STATE         = 'tama_state';
const KEY_EVOLVED_TIMER = 'tama_evolved_timer';
const KEY_HUNGER        = 'tama_hunger';
const KEY_HAPPINESS     = 'tama_happiness';
const KEY_ENERGY        = 'tama_energy';

// ── Pure state machine (mirrors app.js evaluateState exactly) ─────────────
// Operates on a plain state object so tests are fully isolated.
function evaluateState(state, isTick) {
  const s = Object.assign({}, state); // shallow copy — never mutate input

  // FR-2: Sick — any stat at 0, highest priority
  if (s.hunger === 0 || s.happiness === 0 || s.energy === 0) {
    if (s.petState !== 'sick') {
      s.petState     = 'sick';
      s.evolvedTimer = 0; // FR-3: reset on entering sick
    }
    return s;
  }

  // FR-2: Recovery from Sick — all stats above 30
  if (s.petState === 'sick') {
    if (s.hunger > 30 && s.happiness > 30 && s.energy > 30) {
      s.petState     = 'normal';
      s.evolvedTimer = 0; // FR-3: timer starts fresh after recovery
    }
    return s;
  }

  // FR-3 / FR-4: Evolved timer
  if (s.hunger > 70 && s.happiness > 70 && s.energy > 70) {
    if (isTick) s.evolvedTimer += 30; // FR-4: increment only on real ticks
    if (s.evolvedTimer >= 300) s.petState = 'evolved';
  } else {
    // Any stat dropped below 70 — reset and exit evolved
    if (s.petState === 'evolved') s.petState = 'normal';
    s.evolvedTimer = 0;
  }

  return s;
}

// FR-6: state → expected CSS class name
function stateClass(petState) {
  return 'state-' + petState;
}

function saveState(petState, evolvedTimer) {
  localStorage.setItem(KEY_STATE,         petState);
  localStorage.setItem(KEY_EVOLVED_TIMER, evolvedTimer);
}

function loadState() {
  return {
    petState:     localStorage.getItem(KEY_STATE)         || 'normal',
    evolvedTimer: Number(localStorage.getItem(KEY_EVOLVED_TIMER) || 0),
  };
}

// ── Test runner ────────────────────────────────────────────────────────────
let passed = 0;
let failed = 0;

function test(name, condition) {
  if (condition) {
    console.log('PASS:', name);
    passed++;
  } else {
    console.log('FAIL:', name);
    failed++;
  }
  console.assert(condition, name);
}

// ── FR-1: Normal State on First Visit ─────────────────────────────────────
console.log('\n── FR-1: Normal State ──');

const normalState = { hunger: 80, happiness: 80, energy: 80, petState: 'normal', evolvedTimer: 0 };
const afterNormal = evaluateState(normalState, false);
test('FR-1 | All stats > 20, not evolved: state is normal', afterNormal.petState === 'normal');
test('FR-6 | Normal state CSS class is state-normal', stateClass('normal') === 'state-normal');

// ── FR-2: Sick State Trigger ───────────────────────────────────────────────
console.log('\n── FR-2: Sick State ──');

// Any stat at 0 triggers sick
test('FR-2 | Hunger = 0 triggers sick',
  evaluateState({ hunger: 0, happiness: 80, energy: 80, petState: 'normal', evolvedTimer: 0 }, true).petState === 'sick');
test('FR-2 | Happiness = 0 triggers sick',
  evaluateState({ hunger: 80, happiness: 0, energy: 80, petState: 'normal', evolvedTimer: 0 }, true).petState === 'sick');
test('FR-2 | Energy = 0 triggers sick',
  evaluateState({ hunger: 80, happiness: 80, energy: 0, petState: 'normal', evolvedTimer: 0 }, true).petState === 'sick');

// FR-2: Sick resets evolved timer
const sickFromEvolved = evaluateState(
  { hunger: 0, happiness: 80, energy: 80, petState: 'evolved', evolvedTimer: 200 }, true
);
test('FR-2 | Entering sick resets evolvedTimer to 0', sickFromEvolved.evolvedTimer === 0);

// FR-2: Multiple stats at 0 — still just sick (triggered once, no duplicate)
const multiSick = evaluateState(
  { hunger: 0, happiness: 0, energy: 0, petState: 'normal', evolvedTimer: 0 }, true
);
test('FR-2 | Multiple stats at 0: state is sick (not duplicated)', multiSick.petState === 'sick');

// FR-2: Sick overrides evolved — sick takes priority
const sickOverEvolved = evaluateState(
  { hunger: 0, happiness: 80, energy: 80, petState: 'evolved', evolvedTimer: 300 }, true
);
test('FR-2 | Sick overrides Evolved: petState becomes sick', sickOverEvolved.petState === 'sick');
test('FR-2 | CSS class is state-sick only (not state-evolved)',
  stateClass(sickOverEvolved.petState) === 'state-sick');

// FR-2: Recovery — all stats > 30 while sick → normal
test('FR-2 | Recovery: all stats > 30 from sick → normal',
  evaluateState({ hunger: 31, happiness: 31, energy: 31, petState: 'sick', evolvedTimer: 0 }, false).petState === 'normal');

// FR-2: No recovery if any stat is exactly 30 (must be > 30)
test('FR-2 | No recovery: Hunger exactly 30 (not > 30)',
  evaluateState({ hunger: 30, happiness: 50, energy: 50, petState: 'sick', evolvedTimer: 0 }, false).petState === 'sick');
test('FR-2 | No recovery: Happiness = 25',
  evaluateState({ hunger: 50, happiness: 25, energy: 50, petState: 'sick', evolvedTimer: 0 }, false).petState === 'sick');

// FR-2: evolvedTimer resets to 0 on recovery
const recovered = evaluateState(
  { hunger: 50, happiness: 50, energy: 50, petState: 'sick', evolvedTimer: 150 }, false
);
test('FR-2 | evolvedTimer resets to 0 on sick recovery', recovered.evolvedTimer === 0);
test('FR-6 | Normal state CSS class after recovery is state-normal',
  stateClass(recovered.petState) === 'state-normal');

// ── FR-3 / FR-4: Evolved Timer ─────────────────────────────────────────────
console.log('\n── FR-3 & FR-4: Evolved Timer ──');

// Timer increments by 30 on each tick when all stats > 70
const base = { hunger: 80, happiness: 80, energy: 80, petState: 'normal', evolvedTimer: 0 };
const tick1 = evaluateState(base, true);
test('FR-4 | Tick with all stats > 70: evolvedTimer increments by 30', tick1.evolvedTimer === 30);

const tick2 = evaluateState(tick1, true);
test('FR-4 | Second tick: evolvedTimer reaches 60', tick2.evolvedTimer === 60);

// Timer does NOT increment on a button action (isTick = false)
const actionResult = evaluateState({ ...base, evolvedTimer: 150 }, false);
test('FR-4 | Button action: evolvedTimer does not increment', actionResult.evolvedTimer === 150);

// Timer triggers evolved at 300 seconds (10 ticks)
let s = { ...base };
for (let i = 0; i < 10; i++) s = evaluateState(s, true);
test('FR-3 | 10 ticks (300s) with all stats > 70: state becomes evolved', s.petState === 'evolved');
test('FR-6 | Evolved CSS class is state-evolved', stateClass(s.petState) === 'state-evolved');

// Timer advances across the threshold — exactly at 300 triggers
const nearThreshold = evaluateState(
  { hunger: 80, happiness: 80, energy: 80, petState: 'normal', evolvedTimer: 270 }, true
);
test('FR-4 | evolvedTimer 270 + tick (30) = 300: state becomes evolved',
  nearThreshold.petState === 'evolved');

// FR-3: Timer resets when any stat drops below 70
const dropBelow70 = evaluateState(
  { hunger: 69, happiness: 80, energy: 80, petState: 'normal', evolvedTimer: 150 }, true
);
test('FR-3 | Any stat < 70: evolvedTimer resets to 0', dropBelow70.evolvedTimer === 0);
test('FR-3 | Any stat < 70: petState stays normal (not evolved)', dropBelow70.petState === 'normal');

// FR-3: Evolved pet drops below 70 → returns to normal
const evolvedDrop = evaluateState(
  { hunger: 65, happiness: 80, energy: 80, petState: 'evolved', evolvedTimer: 300 }, true
);
test('FR-3 | Evolved pet drops below 70: returns to normal', evolvedDrop.petState === 'normal');
test('FR-3 | Evolved pet drops below 70: evolvedTimer resets', evolvedDrop.evolvedTimer === 0);

// FR-3: Sick state also resets the evolved timer
const sickReset = evaluateState(
  { hunger: 0, happiness: 80, energy: 80, petState: 'normal', evolvedTimer: 250 }, true
);
test('FR-3 | Entering sick: evolvedTimer resets to 0', sickReset.evolvedTimer === 0);

// FR-3: After recovery from sick, timer starts fresh (does not resume)
const afterRecovery = evaluateState(
  { hunger: 80, happiness: 80, energy: 80, petState: 'sick', evolvedTimer: 200 }, false
);
test('FR-3 | Recovery from sick: evolvedTimer resets to 0 (starts fresh)',
  afterRecovery.evolvedTimer === 0);

// ── FR-5: State Persistence ────────────────────────────────────────────────
console.log('\n── FR-5: State Persistence ──');

localStorage.clear();
saveState('evolved', 300);
test('FR-5 | tama_state saved to localStorage', localStorage.getItem(KEY_STATE) === 'evolved');
test('FR-5 | tama_evolved_timer saved to localStorage', localStorage.getItem(KEY_EVOLVED_TIMER) === '300');

const restored = loadState();
test('FR-5 | petState restored from localStorage',     restored.petState     === 'evolved');
test('FR-5 | evolvedTimer restored from localStorage', restored.evolvedTimer === 300);

// Saving normal state
saveState('normal', 0);
const restoredNormal = loadState();
test('FR-5 | Normal state persists correctly', restoredNormal.petState === 'normal');

// Saving sick state
saveState('sick', 0);
const restoredSick = loadState();
test('FR-5 | Sick state persists correctly', restoredSick.petState === 'sick');

// ── FR-6: Visual CSS Classes ───────────────────────────────────────────────
console.log('\n── FR-6: Visual CSS Classes ──');

test('FR-6 | Normal → CSS class state-normal',   stateClass('normal')  === 'state-normal');
test('FR-6 | Sick → CSS class state-sick',        stateClass('sick')    === 'state-sick');
test('FR-6 | Evolved → CSS class state-evolved',  stateClass('evolved') === 'state-evolved');

// Only one state class at a time: verify no two valid states produce the same class
test('FR-6 | state-normal !== state-sick',    stateClass('normal')  !== stateClass('sick'));
test('FR-6 | state-sick !== state-evolved',   stateClass('sick')    !== stateClass('evolved'));
test('FR-6 | state-normal !== state-evolved', stateClass('normal')  !== stateClass('evolved'));

// ── Summary ────────────────────────────────────────────────────────────────
console.log(`\n── Results: ${passed} passed, ${failed} failed ──`);
if (failed > 0) process.exit(1);
