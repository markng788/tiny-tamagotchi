# Requirements: Care Loop

## Functional Requirements

### FR-1: Feed Action
- Trigger: User clicks Feed button
- Effect: Hunger +20
- Cap: Hunger cannot exceed 100
- Formula: `new_hunger = Math.min(current_hunger + 20, 100)`
- Disabled condition: Hunger is already at 100

### FR-2: Play Action
- Trigger: User clicks Play button
- Effect: Happiness +20, Energy −10
- Cap: Happiness cannot exceed 100, Energy cannot go below 0
- Formula: `new_happiness = Math.min(current_happiness + 20, 100)`
- Formula: `new_energy = Math.max(current_energy - 10, 0)`
- Disabled condition: Energy is at 0

### FR-3: Rest Action
- Trigger: User clicks Rest button
- Effect: Energy +30, Happiness −5
- Cap: Energy cannot exceed 100, Happiness cannot go below 0
- Formula: `new_energy = Math.min(current_energy + 30, 100)`
- Formula: `new_happiness = Math.max(current_happiness - 5, 0)`
- Disabled condition: Energy is already at 100

### FR-4: Button States
- Each button must visually appear disabled (greyed out) when its disabled condition is met
- Disabled buttons must not trigger any stat changes when clicked

### FR-5: Immediate UI Update
- Progress bars must update within 100ms of button click
- Updated stats must be saved to localStorage immediately after each action

### FR-6: Sick State Compatibility
- All three buttons remain enabled during Sick state (except their normal disabled conditions)
- Actions during Sick state follow the same stat change rules
- If all stats rise above 30 after an action, pet recovers from Sick state immediately

## Non-Functional Requirements
- Button click handlers must check disabled conditions before applying stat changes
- localStorage save uses same keys as Living Vitals: `tama_hunger`, `tama_happiness`, `tama_energy`
