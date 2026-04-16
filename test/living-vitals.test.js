// ── Test Suite: Living Vitals ──────────────────────────────────────────────
// Tests FR-1 (initialization), FR-2 (decay), FR-3 (offline calculation),
// FR-5 (localStorage persistence).
// Run with: node test/living-vitals.test.js

// ── Mock: setInterval ──────────────────────────────────────────────────────
// Capture the tick callback so tests can fire it manually.
let capturedTickFn = null;
global.setInterval = function (fn) { capturedTickFn = fn; };

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
const KEY_LAST_SAVED = 'tama_last_saved';
const TICK_MS        = 30000;
const DECAY_HUNGER   = 5;
const DECAY_HAPPINESS = 3;
const DECAY_ENERGY   = 4;

// ── Pure logic (mirrors app.js) ────────────────────────────────────────────
function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function loadStats() {
  const h = localStorage.getItem(KEY_HUNGER);
  const a = localStorage.getItem(KEY_HAPPINESS);
  const e = localStorage.getItem(KEY_ENERGY);
  return {
    hunger:    h !== null ? clamp(Number(h), 0, 100) : 80,
    happiness: a !== null ? clamp(Number(a), 0, 100) : 80,
    energy:    e !== null ? clamp(Number(e), 0, 100) : 80,
  };
}

function applyOfflineDecay(stats, lastSavedMs) {
  if (lastSavedMs === null) return stats;
  const elapsed = Date.now() - Number(lastSavedMs);
  const ticks   = Math.floor(elapsed / TICK_MS);
  if (ticks <= 0) return stats;
  return {
    hunger:    clamp(stats.hunger    - DECAY_HUNGER    * ticks, 0, 100),
    happiness: clamp(stats.happiness - DECAY_HAPPINESS * ticks, 0, 100),
    energy:    clamp(stats.energy    - DECAY_ENERGY    * ticks, 0, 100),
  };
}

function applyTick(stats) {
  return {
    hunger:    clamp(stats.hunger    - DECAY_HUNGER,    0, 100),
    happiness: clamp(stats.happiness - DECAY_HAPPINESS, 0, 100),
    energy:    clamp(stats.energy    - DECAY_ENERGY,    0, 100),
  };
}

function saveStats(stats) {
  localStorage.setItem(KEY_HUNGER,     stats.hunger);
  localStorage.setItem(KEY_HAPPINESS,  stats.happiness);
  localStorage.setItem(KEY_ENERGY,     stats.energy);
  localStorage.setItem(KEY_LAST_SAVED, Date.now());
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

// ── FR-1: Stat Initialization ──────────────────────────────────────────────
console.log('\n── FR-1: Stat Initialization ──');

// Test 1a: First visit — no localStorage — defaults to 80
localStorage.clear();
const fresh = loadStats();
test('FR-1 | First visit: Hunger defaults to 80',    fresh.hunger    === 80);
test('FR-1 | First visit: Happiness defaults to 80', fresh.happiness === 80);
test('FR-1 | First visit: Energy defaults to 80',    fresh.energy    === 80);

// Test 1b: Existing localStorage values are loaded
localStorage.clear();
localStorage.setItem(KEY_HUNGER,    '60');
localStorage.setItem(KEY_HAPPINESS, '55');
localStorage.setItem(KEY_ENERGY,    '70');
const loaded = loadStats();
test('FR-1 | Loads Hunger from localStorage',    loaded.hunger    === 60);
test('FR-1 | Loads Happiness from localStorage', loaded.happiness === 55);
test('FR-1 | Loads Energy from localStorage',    loaded.energy    === 70);

// ── FR-2: Stat Decay ───────────────────────────────────────────────────────
console.log('\n── FR-2: Stat Decay ──');

// Test 2a: One tick from 80
const afterOneTick = applyTick({ hunger: 80, happiness: 80, energy: 80 });
test('FR-2 | One tick: Hunger 80 → 75',    afterOneTick.hunger    === 75);
test('FR-2 | One tick: Happiness 80 → 77', afterOneTick.happiness === 77);
test('FR-2 | One tick: Energy 80 → 76',    afterOneTick.energy    === 76);

// Test 2b: Stats floor at 0, never go negative
const floored = applyTick({ hunger: 1, happiness: 1, energy: 1 });
test('FR-2 | Stat floor: Hunger cannot go below 0',    floored.hunger    === 0);
test('FR-2 | Stat floor: Happiness cannot go below 0', floored.happiness === 0);
test('FR-2 | Stat floor: Energy cannot go below 0',    floored.energy    === 0);

// Test 2c: Decay amounts are correct per spec
const base = { hunger: 50, happiness: 50, energy: 50 };
const decayed = applyTick(base);
test('FR-2 | Hunger decays by exactly 5',    decayed.hunger    === base.hunger    - DECAY_HUNGER);
test('FR-2 | Happiness decays by exactly 3', decayed.happiness === base.happiness - DECAY_HAPPINESS);
test('FR-2 | Energy decays by exactly 4',    decayed.energy    === base.energy    - DECAY_ENERGY);

// ── FR-3: Offline Time Calculation ────────────────────────────────────────
console.log('\n── FR-3: Offline Time Calculation ──');

// Test 3a: 5 minutes offline = 10 ticks applied
const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
const afterOffline = applyOfflineDecay(
  { hunger: 80, happiness: 80, energy: 80 },
  String(fiveMinutesAgo)
);
test('FR-3 | 5 min offline (10 ticks): Hunger 80 → 30',    afterOffline.hunger    === 30);
test('FR-3 | 5 min offline (10 ticks): Happiness 80 → 50', afterOffline.happiness === 50);
test('FR-3 | 5 min offline (10 ticks): Energy 80 → 40',    afterOffline.energy    === 40);

// Test 3b: Stats do not go below 0 after offline decay
const longOffline = Date.now() - 60 * 60 * 1000; // 1 hour offline
const cappedOffline = applyOfflineDecay(
  { hunger: 10, happiness: 10, energy: 10 },
  String(longOffline)
);
test('FR-3 | Long offline: Hunger never goes below 0',    cappedOffline.hunger    >= 0);
test('FR-3 | Long offline: Happiness never goes below 0', cappedOffline.happiness >= 0);
test('FR-3 | Long offline: Energy never goes below 0',    cappedOffline.energy    >= 0);

// Test 3c: No lastSaved — no decay applied (first visit)
const noLastSaved = applyOfflineDecay({ hunger: 80, happiness: 80, energy: 80 }, null);
test('FR-3 | No lastSaved: no offline decay applied', noLastSaved.hunger === 80);

// Test 3d: Partial tick (e.g. 20 seconds elapsed) — no ticks applied
const twentySecondsAgo = Date.now() - 20 * 1000;
const partialElapsed = applyOfflineDecay(
  { hunger: 80, happiness: 80, energy: 80 },
  String(twentySecondsAgo)
);
test('FR-3 | Partial tick (<30s): no decay applied', partialElapsed.hunger === 80);

// ── FR-5: localStorage Persistence ────────────────────────────────────────
console.log('\n── FR-5: localStorage Persistence ──');

// Test 5a: saveStats writes correct keys
localStorage.clear();
saveStats({ hunger: 60, happiness: 55, energy: 70 });
test('FR-5 | Saves tama_hunger to localStorage',    localStorage.getItem(KEY_HUNGER)    === '60');
test('FR-5 | Saves tama_happiness to localStorage', localStorage.getItem(KEY_HAPPINESS) === '55');
test('FR-5 | Saves tama_energy to localStorage',    localStorage.getItem(KEY_ENERGY)    === '70');
test('FR-5 | Saves tama_last_saved timestamp',      localStorage.getItem(KEY_LAST_SAVED) !== null);

// Test 5b: Saved values survive a reload (re-read from storage)
const reloaded = loadStats();
test('FR-5 | Reloaded Hunger matches saved value',    reloaded.hunger    === 60);
test('FR-5 | Reloaded Happiness matches saved value', reloaded.happiness === 55);
test('FR-5 | Reloaded Energy matches saved value',    reloaded.energy    === 70);

// ── Summary ────────────────────────────────────────────────────────────────
console.log(`\n── Results: ${passed} passed, ${failed} failed ──`);
if (failed > 0) process.exit(1);
