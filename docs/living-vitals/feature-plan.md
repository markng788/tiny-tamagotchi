# Feature Plan: Living Vitals

## Overview
Implement three stats (Hunger, Happiness, Energy) that automatically decrease over time to simulate a living pet that needs care.

## Goals
- Stats visually displayed as progress bars (0–100)
- Stats decrease automatically every 30 seconds without user action
- Stats persist after page refresh via localStorage
- When any stat reaches 0, pet transitions to Sick state

## User Flow
1. User opens the app for the first time
2. All stats start at 80
3. Every 30 seconds, stats decrease automatically:
   - Hunger: −5
   - Happiness: −3
   - Energy: −4
4. Progress bars update in real time to reflect current values
5. If any stat hits 0, Sick state is triggered
6. On page refresh, stats are loaded from localStorage and continue decreasing

## Edge Cases
- If user closes browser and reopens after 10 minutes, stats are recalculated based on time elapsed
- Stats cannot go below 0 or above 100
- If multiple stats hit 0 at the same time, Sick state is still only triggered once
