# Requirements: Dynamic States

## Functional Requirements

### FR-1: Normal State
- Condition: All stats above 20 and pet is not Evolved
- Visual: Default pet appearance (white/neutral color)
- No special message displayed

### FR-2: Sick State
- Trigger: Any stat reaches 0
- Visual: Pet appearance changes to sick (grey color, sad expression)
- Message displayed: "Your pet is sick! Feed, play, and rest to recover."
- Priority: Sick state overrides Evolved state
- Recovery condition: All stats rise above 30
- On recovery: Pet returns to Normal state, Evolved timer resets to 0

### FR-3: Evolved State
- Trigger: All stats remain above 70 for 5 consecutive minutes (300 seconds)
- Visual: Pet appearance changes to evolved (gold color, happy expression)
- Message displayed: "Your pet has evolved!"
- Timer: Evolved timer increments every 30 seconds when all stats are above 70
- Timer reset conditions:
  - Any stat drops below 70
  - Pet enters Sick state
  - Pet recovers from Sick state

### FR-4: Evolved Timer
- Timer stored in localStorage key: `tama_evolved_timer` (value in seconds)
- Timer increments by 30 every tick when all stats above 70
- Timer resets to 0 when any condition in FR-3 reset conditions is met
- Evolved state is triggered when `tama_evolved_timer` reaches 300

### FR-5: State Persistence
- Current state saved to localStorage key: `tama_state`
- Evolved timer saved to localStorage key: `tama_evolved_timer`
- On page load, state and timer are restored from localStorage
- State transitions are re-evaluated immediately on page load based on current stats

### FR-6: Visual Implementation
- Normal state: pet element has CSS class `state-normal`
- Sick state: pet element has CSS class `state-sick`
- Evolved state: pet element has CSS class `state-evolved`
- Only one state class is applied at a time
- State class changes must complete within 100ms of state transition

## Non-Functional Requirements
- State evaluation runs after every stat change and every tick
- State priority order: Sick > Evolved > Normal
- No animation duration should exceed 500ms
