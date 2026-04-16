# Project Roadmap

## Phase 1: Living Vitals
- Implement Hunger, Happiness, and Energy stats (0–100)
- Stats tick down automatically every 30 seconds
- Display stats as progress bars on screen
- Save stats to localStorage on every change

## Phase 2: Care Loop
- Implement Feed action: Hunger +20
- Implement Play action: Happiness +20, Energy −10
- Implement Rest action: Energy +30, Happiness −5
- Buttons disabled when stat is already at 100
- Save state to localStorage after every action

## Phase 3: Dynamic States
- Normal state: all stats above 20
- Sick state: triggered when any stat reaches 0
- Recovery from Sick: all stats brought above 30 via Feed, Play, Rest
- Evolved state: all stats above 70 for 5 consecutive minutes
- Visual change for each state (different pet image or color)

## Phase 4: Personal Touches
- Pet naming screen on first visit
- Quirky reaction messages when stats are very low
- Evolved state shows special appearance
- Smooth stat bar animations
