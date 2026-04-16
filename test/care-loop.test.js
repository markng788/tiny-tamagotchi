// ── Test Suite: Care Loop ─────────────────────────────────────────────────
// Tests FR-1 (Feed), FR-2 (Play), FR-3 (Rest), FR-4 (button disabled
// conditions), FR-5 (localStorage save), FR-6 (sick state compatibility).
// Run with: node test/care-loop.test.js

// ── Mock: localStorage ─────────────────────────────────────────────────────
const store = {};
global.localStorage = {
  getItem:    (k)    => (k in store ? store[k] : null),
  setItem:    (k, v) => { store[k] = String(v); },
  removeItem: (k)    => { delete store[k]; },
  clear:      ()     => { Object.keys(store).forEach(k => delete store[k]); },
};

// ── Constants (mirrors app.js) ─────────────────────────────────────────────
const KEY_HUNGER     = 'tama_hunger';
const KEY_HAPPINESS  = 'tama_happiness';
const KEY_ENERGY     = 'tama_energy';
const KEY_STATE      = 'tama_state';

// ── Pure logic (mirrors app.js) ────────────────────────────────────────────
function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

// Action formulas exactly as specified in requirements
function feed(hunger) {
  return Math.min(hunger + 20, 100);
}

function play(happiness, energy) {
  return {
    happiness: Math.min(happiness + 20, 100),
    energy:    Math.max(energy    - 10,   0),
  };
}

function rest(energy, happiness) {
  return {
    energy:    Math.min(energy    + 30, 100),
    happiness: Math.max(happiness -  5,   0),
  };
}

// Button disabled conditions (mirrors app.js updateButtons)
function isFeedDisabled(hunger)   { return hunger >= 100; }
function isPlayDisabled(energy)   { return energy <= 0;   }
function isRestDisabled(energy)   { return energy >= 100; }

// State evaluation for sick/recovery (mirrors app.js evaluateState)
function evaluateState(hunger, happiness, energy, petState) {
  if (hunger === 0 || happiness === 0 || energy === 0) {
    return 'sick';
  }
  if (petState === 'sick') {
    if (hunger > 30 && happiness > 30 && energy > 30) return 'normal';
    return 'sick';
  }
  return petState;
}

function saveStats(hunger, happiness, energy, state) {
  localStorage.setItem(KEY_HUNGER,    hunger);
  localStorage.setItem(KEY_HAPPINESS, happiness);
  localStorage.setItem(KEY_ENERGY,    energy);
  localStorage.setItem(KEY_STATE,     state);
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

// ── FR-1: Feed Action ──────────────────────────────────────────────────────
console.log('\n── FR-1: Feed Action ──');

test('FR-1 | Feed: Hunger 50 → 70',                feed(50)  === 70);
test('FR-1 | Feed: Hunger 80 → 100',               feed(80)  === 100);
test('FR-1 | Feed cap: Hunger 90 → 100 (not 110)', feed(90)  === 100);
test('FR-1 | Feed cap: Hunger 100 → 100',          feed(100) === 100);

// ── FR-2: Play Action ──────────────────────────────────────────────────────
console.log('\n── FR-2: Play Action ──');

const play1 = play(50, 50);
test('FR-2 | Play: Happiness 50 → 70',              play1.happiness === 70);
test('FR-2 | Play: Energy 50 → 40',                 play1.energy    === 40);

const play2 = play(90, 50);
test('FR-2 | Play cap: Happiness 90 → 100 (not 110)', play2.happiness === 100);

const play3 = play(50, 5);
test('FR-2 | Play floor: Energy 5 → 0 (not -5)',   play3.energy === 0);

const play4 = play(50, 0);
test('FR-2 | Play floor: Energy 0 stays 0',        play4.energy === 0);

// ── FR-3: Rest Action ──────────────────────────────────────────────────────
console.log('\n── FR-3: Rest Action ──');

const rest1 = rest(50, 50);
test('FR-3 | Rest: Energy 50 → 80',                rest1.energy    === 80);
test('FR-3 | Rest: Happiness 50 → 45',             rest1.happiness === 45);

const rest2 = rest(80, 50);
test('FR-3 | Rest cap: Energy 80 → 100 (not 110)', rest2.energy === 100);

const rest3 = rest(50, 3);
test('FR-3 | Rest floor: Happiness 3 → 0 (not -2)', rest3.happiness === 0);

const rest4 = rest(50, 0);
test('FR-3 | Rest floor: Happiness 0 stays 0',     rest4.happiness === 0);

// ── FR-4: Button Disabled Conditions ──────────────────────────────────────
console.log('\n── FR-4: Button Disabled Conditions ──');

test('FR-4 | Feed disabled when Hunger = 100',   isFeedDisabled(100) === true);
test('FR-4 | Feed enabled when Hunger = 99',     isFeedDisabled(99)  === false);
test('FR-4 | Feed enabled when Hunger = 0',      isFeedDisabled(0)   === false);

test('FR-4 | Play disabled when Energy = 0',     isPlayDisabled(0)   === true);
test('FR-4 | Play enabled when Energy = 1',      isPlayDisabled(1)   === false);
test('FR-4 | Play enabled when Energy = 100',    isPlayDisabled(100) === false);

test('FR-4 | Rest disabled when Energy = 100',   isRestDisabled(100) === true);
test('FR-4 | Rest enabled when Energy = 99',     isRestDisabled(99)  === false);
test('FR-4 | Rest enabled when Energy = 0',      isRestDisabled(0)   === false);

// Clicking a disabled button must not change stats
// (Guard check mirrors the if (btnX.disabled) return in app.js)
{
  let hunger = 100;
  if (!isFeedDisabled(hunger)) hunger = feed(hunger);
  test('FR-4 | Clicking Feed when disabled does not change Hunger', hunger === 100);
}

{
  let energy = 0; let happiness = 50;
  const prev = { energy, happiness };
  if (!isPlayDisabled(energy)) {
    const r = play(happiness, energy);
    happiness = r.happiness;
    energy    = r.energy;
  }
  test('FR-4 | Clicking Play when Energy=0 does not change stats',
    energy === prev.energy && happiness === prev.happiness);
}

// ── FR-5: localStorage Save After Action ──────────────────────────────────
console.log('\n── FR-5: localStorage Save After Action ──');

localStorage.clear();
saveStats(70, 50, 40, 'normal');
test('FR-5 | Hunger saved to localStorage after action',    localStorage.getItem(KEY_HUNGER)    === '70');
test('FR-5 | Happiness saved to localStorage after action', localStorage.getItem(KEY_HAPPINESS) === '50');
test('FR-5 | Energy saved to localStorage after action',    localStorage.getItem(KEY_ENERGY)    === '40');

// Simulate Feed then verify updated value persists
let h = 50;
h = feed(h);
saveStats(h, 80, 80, 'normal');
test('FR-5 | Updated Hunger persists after Feed + save', localStorage.getItem(KEY_HUNGER) === '70');

// ── FR-6: Sick State Compatibility ────────────────────────────────────────
console.log('\n── FR-6: Sick State Compatibility ──');

// Actions still apply stat changes while sick
const feedWhileSick = feed(10);
test('FR-6 | Feed still works while Sick (Hunger 10 → 30)', feedWhileSick === 30);

const playWhileSick = play(10, 50);
test('FR-6 | Play still changes Happiness while Sick', playWhileSick.happiness === 30);
test('FR-6 | Play still changes Energy while Sick',    playWhileSick.energy    === 40);

const restWhileSick = rest(10, 10);
test('FR-6 | Rest still changes Energy while Sick',    restWhileSick.energy    === 40);
test('FR-6 | Rest still changes Happiness while Sick', restWhileSick.happiness === 5);

// Recovery: all stats > 30 while in sick state → returns normal
test('FR-6 | Recovery: all stats > 30 → state becomes normal',
  evaluateState(31, 31, 31, 'sick') === 'normal');

// Still sick when any stat is <= 30
test('FR-6 | No recovery: Hunger = 30 (not > 30)',
  evaluateState(30, 50, 50, 'sick') === 'sick');
test('FR-6 | No recovery: Energy = 0',
  evaluateState(50, 50, 0, 'sick') === 'sick');

// Sick triggered when a stat hits 0 (e.g. energy drops to 0 after Play)
const playDrainsEnergy = play(50, 10);
test('FR-6 | Play draining Energy to 0 triggers Sick evaluation',
  evaluateState(50, playDrainsEnergy.happiness, playDrainsEnergy.energy, 'normal') === 'sick');

// ── Summary ────────────────────────────────────────────────────────────────
console.log(`\n── Results: ${passed} passed, ${failed} failed ──`);
if (failed > 0) process.exit(1);
