// ── localStorage keys ──────────────────────────────────────────────────────
const KEY_HUNGER     = 'tama_hunger';
const KEY_HAPPINESS  = 'tama_happiness';
const KEY_ENERGY     = 'tama_energy';
const KEY_LAST_SAVED    = 'tama_last_saved';
const KEY_STATE         = 'tama_state';
const KEY_EVOLVED_TIMER = 'tama_evolved_timer';
const KEY_NAME          = 'tama_name';

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
let petName    = '';

// ── DOM references ─────────────────────────────────────────────────────────
const namingScreen  = document.getElementById('naming-screen');
const gameScreen    = document.getElementById('game-screen');
const nameInput     = document.getElementById('name-input');
const btnStart      = document.getElementById('btn-start');
const petNameEl     = document.getElementById('pet-name');
const petEl         = document.getElementById('pet');
const stateMsg      = document.getElementById('state-message');
const barHunger     = document.getElementById('bar-hunger');
const barHappiness  = document.getElementById('bar-happiness');
const barEnergy     = document.getElementById('bar-energy');
const valHunger     = document.getElementById('val-hunger');
const valHappiness  = document.getElementById('val-happiness');
const valEnergy     = document.getElementById('val-energy');
const btnFeed       = document.getElementById('btn-feed');
const btnPlay       = document.getElementById('btn-play');
const btnRest       = document.getElementById('btn-rest');

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
 * Priority: Sick > Evolved > Normal (FR-2 overrides all).
 *
 * @param {boolean} isTick - true only when called from the 30-second tick.
 *   The evolved timer increments only on real ticks (FR-4); resets happen
 *   on both ticks and button actions.
 */
function evaluateState(isTick) {
  // ── FR-2: Sick — any stat at 0, highest priority ──────────────────────
  if (hunger === 0 || happiness === 0 || energy === 0) {
    if (petState !== 'sick') {
      petState     = 'sick';
      evolvedTimer = 0; // FR-3: reset on entering sick
    }
    return;
  }

  // ── FR-2: Recovery from Sick — all stats above 30 ─────────────────────
  if (petState === 'sick') {
    if (hunger > 30 && happiness > 30 && energy > 30) {
      petState     = 'normal';
      evolvedTimer = 0; // FR-3: timer starts fresh after recovery
    }
    return; // stay sick until recovery threshold met
  }

  // ── FR-3 / FR-4: Evolved timer ─────────────────────────────────────────
  if (hunger > 70 && happiness > 70 && energy > 70) {
    // Increment only on a real 30-second tick, not on every button press
    if (isTick) evolvedTimer += 30;
    if (evolvedTimer >= 300) {
      petState = 'evolved'; // FR-3: trigger evolved at 300 s
    }
  } else {
    // Any stat dropped below 70 — reset timer and exit evolved (FR-3)
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

/** Update disabled state of action buttons based on current stats (FR-4). */
function updateButtons() {
  // Feed disabled when Hunger is already at 100
  btnFeed.disabled = (hunger >= 100);
  // Play disabled when Energy is at 0 (too tired to play)
  btnPlay.disabled = (energy <= 0);
  // Rest disabled when Energy is already at 100
  btnRest.disabled = (energy >= 100);
}

function render() {
  updateBar(barHunger,    valHunger,    hunger);
  updateBar(barHappiness, valHappiness, happiness);
  updateBar(barEnergy,    valEnergy,    energy);
  updatePetVisual();
  updateButtons();
}

// ── Tick ───────────────────────────────────────────────────────────────────

function tick() {
  hunger    = clamp(hunger    - DECAY_HUNGER,    0, 100);
  happiness = clamp(happiness - DECAY_HAPPINESS, 0, 100);
  energy    = clamp(energy    - DECAY_ENERGY,    0, 100);

  evaluateState(true); // real tick — evolved timer may advance
  saveToStorage();
  render();
}

// ── Action handlers ────────────────────────────────────────────────────────

/** Shared post-action routine: evaluate state, save, and re-render. */
function afterAction() {
  evaluateState(false); // button action — timer resets apply but no increment
  saveToStorage();
  render();
}

// FR-1: Feed — Hunger +20, capped at 100
function onFeed() {
  if (btnFeed.disabled) return;
  hunger = Math.min(hunger + 20, 100);
  afterAction();
}

// FR-2: Play — Happiness +20 (cap 100), Energy -10 (floor 0)
function onPlay() {
  if (btnPlay.disabled) return;
  happiness = Math.min(happiness + 20, 100);
  energy    = Math.max(energy    - 10,   0);
  afterAction();
}

// FR-3: Rest — Energy +30 (cap 100), Happiness -5 (floor 0)
function onRest() {
  if (btnRest.disabled) return;
  energy    = Math.min(energy    + 30, 100);
  happiness = Math.max(happiness -  5,   0);
  afterAction();
}

// ── Reset ──────────────────────────────────────────────────────────────────

document.getElementById('btn-reset').addEventListener('click', function () {
  localStorage.clear();
  location.reload();
});

// ── Naming screen ──────────────────────────────────────────────────────────

/** Show game screen and start the game loop. */
function startGame() {
  namingScreen.classList.add('hidden');
  gameScreen.classList.remove('hidden');
  petNameEl.textContent = petName;

  loadFromStorage();
  applyOfflineDecay();
  evaluateState(false);
  saveToStorage();
  render();

  btnFeed.addEventListener('click', onFeed);
  btnPlay.addEventListener('click', onPlay);
  btnRest.addEventListener('click', onRest);

  setInterval(tick, TICK_MS);
}

function onStartClick() {
  const entered = nameInput.value.trim();
  if (!entered) {
    nameInput.focus();
    return;
  }
  petName = entered;
  localStorage.setItem(KEY_NAME, petName);
  startGame();
}

// ── Init ───────────────────────────────────────────────────────────────────

function init() {
  const savedName = localStorage.getItem(KEY_NAME);

  if (savedName) {
    // Returning visit — skip naming screen
    petName = savedName;
    startGame();
  } else {
    // First visit — show naming screen
    gameScreen.classList.add('hidden');
    namingScreen.classList.remove('hidden');
    nameInput.focus();

    btnStart.addEventListener('click', onStartClick);
    // Allow pressing Enter to submit
    nameInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') onStartClick();
    });
  }
}

init();
