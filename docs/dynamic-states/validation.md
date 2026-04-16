# Validation: Dynamic States

## Level 1: Smoke Tests (Automated)

### Test 1: Normal State on First Visit
- Action: Clear localStorage, open app in browser
- Expected: Pet displays in Normal state with default appearance
- Pass condition: Pet element has CSS class `state-normal`
- Covers: FR-1

### Test 2: Sick State Trigger
- Action: Set Hunger to 1 in localStorage, reload page, wait 30 seconds
- Expected: Hunger reaches 0, pet immediately transitions to Sick state
- Pass condition: Pet element has CSS class `state-sick`, message displayed
- Covers: FR-2

### Test 3: Recovery from Sick State
- Action: Trigger Sick state, then click Feed, Play, Rest until all stats above 30
- Expected: Pet returns to Normal state
- Pass condition: Pet element has CSS class `state-normal`, sick message disappears
- Covers: FR-2

### Test 4: Evolved Timer Increment
- Action: Set all stats to 80 in localStorage, set `tama_evolved_timer` to 270, reload page, wait 30 seconds
- Expected: Evolved timer reaches 300, pet transitions to Evolved state
- Pass condition: Pet element has CSS class `state-evolved`, evolved message displayed
- Covers: FR-3, FR-4

### Test 5: Evolved Timer Reset
- Action: Set all stats to 80, `tama_evolved_timer` to 150, reload page, click Rest to drop Happiness below 70
- Expected: Evolved timer resets to 0
- Pass condition: `tama_evolved_timer` in localStorage shows 0
- Covers: FR-3, FR-4

### Test 6: Sick Overrides Evolved
- Action: Trigger Evolved state, then set any stat to 0
- Expected: Pet transitions to Sick state immediately, Evolved appearance disappears
- Pass condition: Pet element has CSS class `state-sick` only, no `state-evolved` class
- Covers: FR-2, FR-3

### Test 7: State Persistence
- Action: Trigger Evolved state, refresh page
- Expected: Pet remains in Evolved state after refresh
- Pass condition: Pet element has CSS class `state-evolved` on reload
- Covers: FR-5

## Level 2: User Flow Tests (Manual)

### Test 8: Full Care Cycle
- Action: Start fresh, let pet get Sick, recover it, then maintain all stats above 70 for 5 minutes
- Expected: Pet progresses from Normal to Sick to Normal to Evolved
- Pass condition: All three states are observed with correct visuals in sequence
- Covers: FR-1, FR-2, FR-3

### Test 9: Visual State Changes
- Action: Trigger each state manually
- Expected: Each state shows distinctly different pet appearance and color
- Pass condition: Normal (white), Sick (grey), Evolved (gold) appearances are clearly distinguishable
- Covers: FR-6

## Testing Suite
Create a file `test/dynamic-states.test.js` that:
- Mocks localStorage and `setInterval`
- Tests FR-2 (Sick state trigger and recovery)
- Tests FR-3 and FR-4 (Evolved timer increment and reset)
- Tests FR-5 (state persistence on reload)
- Tests FR-6 (correct CSS class applied for each state)
- Uses `console.assert()` for each test case
- Logs PASS or FAIL for each test
