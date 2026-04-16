// ── localStorage keys ──────────────────────────────────────────────────────
const KEY_HUNGER     = 'tama_hunger';
const KEY_HAPPINESS  = 'tama_happiness';
const KEY_ENERGY     = 'tama_energy';
const KEY_LAST_SAVED = 'tama_last_saved';
const KEY_STATE      = 'tama_state';
const KEY_EVOLVED_TIMER = 'tama_evolved_timer';

// ── Decay rates per 30-second tick ────────────────────────────────────────
const DECAY_HUNGER    = 5;
const DECAY_HAPPINESS = 3;
const DECAY_ENERGY    = 4;

const TICK_MS = 30000; // 30 seconds

// ── Game state ─────────────────────────────────────────────────────────────
let hunger     = 80;
let happiness  = 80;
let energy     = 80;
let petState   = 'normal'; // 'normal' | 'sick' | 'evolved'
let evolvedTimer = 0;      // seconds accumulated above 70

// ── DOM references ─────────────────────────────────────────────────────────
const petEl         = document.getElementById('pet');
const stateMsg      = document.getElementById('state-message');
const barHunger     = document.getElementById('bar-hunger');
const barHappiness  = document.getElementById('bar-happiness');
const barEnergy     = document.getElementById('bar-energy');
const valHunger     = document.getElementById('val-hunger');
const valHappiness  = document.getElementById('val-happiness');
const valEnergy     = document.getElementById('val-energy');

// ── Helpers ────────────────────────────────────────────────────────────────

/** Clamp a value between min and max. */
function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/** Return the bar colour class based on stat value. */
function barColorClass(value) {
  if (value > 50) return 'color-green';
  if (value > 20) return 'color-yellow';
  return 'color-red';
}

// ── Persistence ────────────────────────────────────────────────────────────

function saveToStorage() {
  localStorage.setItem(KEY_HUNGER,        hunger);
  localStorage.setItem(KEY_HAPPINESS,     happiness);
  localStorage.setItem(KEY_ENERGY,        energy);
  localStorage.setItem(KEY_LAST_SAVED,    Date.now());
  localStorage.setItem(KEY_STATE,         petState);
  localStorage.setItem(KEY_EVOLVED_TIMER, evolvedTimer);
}

function loadFromStorage() {
  const storedHunger    = localStorage.getItem(KEY_HUNGER);
  const storedHappiness = localStorage.getItem(KEY_HAPPINESS);
  const storedEnergy    = localStorage.getItem(KEY_ENERGY);
  const storedState     = localStorage.getItem(KEY_STATE);
  const storedTimer     = localStorage.getItem(KEY_EVOLVED_TIMER);

  if (storedHunger    !== null) hunger       = clamp(Number(storedHunger),    0, 100);
  if (storedHappiness !== null) happiness    = clamp(Number(storedHappiness), 0, 100);
  if (storedEnergy    !== null) energy       = clamp(Number(storedEnergy),    0, 100);
  if (storedState     !== null) petState     = storedState;
  if (storedTimer     !== null) evolvedTimer = Number(storedTimer);
}

// ── Offline catch-up ───────────────────────────────────────────────────────

/**
 * Calculate how many full 30-second ticks passed while the page was closed
 * and apply that many rounds of decay immediately.
 */
function applyOfflineDecay() {
  const lastSaved = localStorage.getItem(KEY_LAST_SAVED);
  if (!lastSaved) return;

  const elapsed = Date.now() - Number(lastSaved); // ms
  const ticks   = Math.floor(elapsed / TICK_MS);
  if (ticks <= 0) return;

  hunger    = clamp(hunger    - DECAY_HUNGER    * ticks, 0, 100);
  happiness = clamp(happiness - DECAY_HAPPINESS * ticks, 0, 100);
  energy    = clamp(energy    - DECAY_ENERGY    * ticks, 0, 100);
}

// ── State evaluation ───────────────────────────────────────────────────────

/**
 * Evaluate and apply the correct pet state based on current stats.
 * Priority: sick > evolved > normal.
 * Also advances / resets the evolved timer.
 */
function evaluateState() {
  // Sick: any stat at 0
  if (hunger === 0 || happiness === 0 || energy === 0) {
    if (petState !== 'sick') {
      petState     = 'sick';
      evolvedTimer = 0;
    }
    return;
  }

  // Recovery from sick: all stats above 30
  if (petState === 'sick') {
    if (hunger > 30 && happiness > 30 && energy > 30) {
      petState     = 'normal';
      evolvedTimer = 0; // timer starts fresh after recovery
    }
    return; // stay sick until recovery threshold met
  }

  // Evolved timer: advance only when all stats > 70
  if (hunger > 70 && happiness > 70 && energy > 70) {
    evolvedTimer += TICK_MS / 1000; // add 30 seconds
    if (evolvedTimer >= 300) {
      petState = 'evolved';
    }
  } else {
    // Any stat dropped below 70 — reset timer, drop out of evolved
    if (petState === 'evolved') petState = 'normal';
    evolvedTimer = 0;
  }
}

// ── UI update ──────────────────────────────────────────────────────────────

function updateBar(barEl, valEl, value) {
  barEl.style.width     = value + '%';
  barEl.className       = 'bar-fill ' + barColorClass(value);
  valEl.textContent     = value;
}

function updatePetVisual() {
  petEl.className = 'state-' + petState;

  switch (petState) {
    case 'sick':
      document.getElementById('pet-eyes').textContent  = 'x x';
      document.getElementById('pet-mouth').textContent = '~';
      stateMsg.textContent = 'Your pet is sick! Feed, play, and rest to recover.';
      break;
    case 'evolved':
      document.getElementById('pet-eyes').textContent  = '^ ^';
      document.getElementById('pet-mouth').textContent = '★';
      stateMsg.textContent = 'Your pet has evolved!';
      break;
    default: // normal
      document.getElementById('pet-eyes').textContent  = '^ ^';
      document.getElementById('pet-mouth').textContent = 'ω';
      stateMsg.textContent = '';
  }
}

function render() {
  updateBar(barHunger,    valHunger,    hunger);
  updateBar(barHappiness, valHappiness, happiness);
  updateBar(barEnergy,    valEnergy,    energy);
  updatePetVisual();
}

// ── Tick ───────────────────────────────────────────────────────────────────

function tick() {
  hunger    = clamp(hunger    - DECAY_HUNGER,    0, 100);
  happiness = clamp(happiness - DECAY_HAPPINESS, 0, 100);
  energy    = clamp(energy    - DECAY_ENERGY,    0, 100);

  evaluateState();
  saveToStorage();
  render();
}

// ── Init ───────────────────────────────────────────────────────────────────

function init() {
  loadFromStorage();
  applyOfflineDecay();
  evaluateState();
  saveToStorage();
  render();

  setInterval(tick, TICK_MS);
}

init();
