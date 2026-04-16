# Requirements: Living Vitals

## Functional Requirements

### FR-1: Stat Initialization
- On first visit, Hunger, Happiness, and Energy are all set to 80
- If localStorage contains saved stats, load those values instead

### FR-2: Stat Decay
- A timer runs every 30 seconds
- Each tick: Hunger −5, Happiness −3, Energy −4
- Stats cannot go below 0

### FR-3: Offline Time Calculation
- On page load, check localStorage for last saved timestamp
- Calculate how many 30-second ticks have passed since last visit
- Apply that many ticks of decay immediately on load
- Stats cannot go below 0 after offline calculation

### FR-4: Stat Display
- Each stat is displayed as a labeled progress bar
- Progress bar fills proportionally to current value (0–100)
- Color coding: green (above 50), yellow (20–50), red (below 20)

### FR-5: localStorage Persistence
- After every tick, save Hunger, Happiness, Energy, and current timestamp to localStorage
- Keys: `tama_hunger`, `tama_happiness`, `tama_energy`, `tama_last_saved`

## Non-Functional Requirements
- Stat decay timer must use `setInterval` with 30000ms interval
- Progress bar updates must complete within 100ms of each tick
- localStorage save must happen within the same tick cycle
