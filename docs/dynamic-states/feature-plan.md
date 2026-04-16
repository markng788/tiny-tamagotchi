# Feature Plan: Dynamic States

## Overview
Implement three pet states (Normal, Sick, Evolved) that change based on the pet's stats, giving the user immediate visual feedback on their caretaking performance.

## Goals
- Pet has a visible appearance that changes with each state
- State transitions happen automatically based on stat values
- Evolved state rewards consistent good caretaking
- Sick state creates urgency to care for the pet
- Current state persists after page refresh via localStorage

## User Flow
1. Pet starts in Normal state on first visit
2. If any stat reaches 0:
   - Pet immediately transitions to Sick state
   - Visual changes to show pet is unwell
   - Message displayed: "Your pet is sick! Feed, play, and rest to recover."
3. User cares for pet until all stats are above 30:
   - Pet recovers and returns to Normal state
4. If all stats stay above 70 for 5 consecutive minutes:
   - Pet transitions to Evolved state
   - Special visual appearance is shown
   - Message displayed: "Your pet has evolved!"
5. If pet is Evolved and any stat drops below 70:
   - Pet returns to Normal state
   - Evolved timer resets to 0

## Edge Cases
- Evolved timer resets if any stat drops below 70 at any point
- Sick state takes priority over Evolved state
- If pet recovers from Sick but stats are all above 70, Evolved timer starts fresh (does not continue from before Sick)
- State is saved to localStorage: `tama_state`, `tama_evolved_timer`
