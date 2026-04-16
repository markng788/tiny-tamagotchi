# Validation: Living Vitals

## Level 1: Smoke Tests (Automated)

### Test 1: Stat Initialization
- Action: Clear localStorage, open app in browser
- Expected: Hunger = 80, Happiness = 80, Energy = 80
- Pass condition: All three progress bars show 80%

### Test 2: Stat Decay
- Action: Wait 30 seconds without any user action
- Expected: Hunger = 75, Happiness = 77, Energy = 76
- Pass condition: Progress bars update to correct values after one tick

### Test 3: Stat Floor
- Action: Manually set all stats to 1 in localStorage, reload page, wait 30 seconds
- Expected: All stats show 0, not negative numbers
- Pass condition: No stat displays below 0

### Test 4: localStorage Persistence
- Action: Wait for one tick, then refresh the page
- Expected: Stats retain their decayed values after refresh
- Pass condition: Stats do not reset to 80 on refresh

### Test 5: Offline Time Calculation
- Action: Save timestamp in localStorage as 5 minutes ago, reload page
- Expected: App applies 10 ticks of decay immediately on load
- Pass condition: Hunger = 30, Happiness = 50, Energy = 40 (from starting 80)

## Level 2: User Flow Tests (Manual)

### Test 6: Color Coding
- Action: Let stats decay naturally over time
- Expected: Progress bars change from green to yellow when below 50, red when below 20
- Pass condition: Color transitions happen at correct thresholds

### Test 7: Sick State Trigger
- Action: Let any stat reach 0
- Expected: Pet transitions to Sick state immediately
- Pass condition: Sick state visual appears when first stat hits 0

## Testing Suite
Create a file `test/living-vitals.test.js` that:
- Mocks `setInterval` and localStorage
- Tests FR-1 (initialization), FR-2 (decay), FR-3 (offline calculation), FR-5 (persistence)
- Uses `console.assert()` for each test case
- Logs PASS or FAIL for each test
