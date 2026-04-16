# Validation: Care Loop

## Level 1: Smoke Tests (Automated)

### Test 1: Feed Action
- Action: Set Hunger to 50 in localStorage, reload page, click Feed button
- Expected: Hunger increases to 70
- Pass condition: Hunger progress bar shows 70%
- Covers: FR-1

### Test 2: Play Action
- Action: Set Happiness to 50, Energy to 50 in localStorage, reload page, click Play button
- Expected: Happiness = 70, Energy = 40
- Pass condition: Both progress bars update correctly
- Covers: FR-2

### Test 3: Rest Action
- Action: Set Energy to 50, Happiness to 50 in localStorage, reload page, click Rest button
- Expected: Energy = 80, Happiness = 45
- Pass condition: Both progress bars update correctly
- Covers: FR-3

### Test 4: Stat Cap on Feed
- Action: Set Hunger to 90, click Feed button
- Expected: Hunger = 100, not 110
- Pass condition: Hunger progress bar shows 100%, no overflow
- Covers: FR-1

### Test 5: Stat Floor on Play
- Action: Set Energy to 5, click Play button
- Expected: Energy = 0, not −5
- Pass condition: Energy progress bar shows 0%, no negative value
- Covers: FR-2

### Test 6: Feed Button Disabled
- Action: Set Hunger to 100, reload page
- Expected: Feed button appears greyed out and is not clickable
- Pass condition: Clicking Feed button does nothing
- Covers: FR-4

### Test 7: localStorage Save After Action
- Action: Click Feed button, immediately refresh page
- Expected: Updated Hunger value persists after refresh
- Pass condition: Hunger does not revert to pre-click value
- Covers: FR-5

## Level 2: User Flow Tests (Manual)

### Test 8: Recovery from Sick State
- Action: Let any stat reach 0 to trigger Sick state, then use Feed, Play, Rest to bring all stats above 30
- Expected: Pet recovers from Sick state and returns to Normal
- Pass condition: Normal state visual appears when all stats exceed 30
- Covers: FR-6

### Test 9: Button Interaction During Sick State
- Action: Trigger Sick state, then click all three buttons
- Expected: All buttons still function normally during Sick state
- Pass condition: Stats update correctly while pet is Sick
- Covers: FR-6

## Testing Suite
Create a file `test/care-loop.test.js` that:
- Mocks localStorage
- Tests FR-1 (Feed), FR-2 (Play), FR-3 (Rest) stat calculations
- Tests FR-4 (button disabled conditions)
- Uses `console.assert()` for each test case
- Logs PASS or FAIL for each test
