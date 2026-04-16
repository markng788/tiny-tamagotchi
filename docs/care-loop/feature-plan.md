# Feature Plan: Care Loop

## Overview
Implement three user actions (Feed, Play, Rest) that allow the user to replenish their pet's stats and keep it healthy.

## Goals
- Three clearly labeled buttons for Feed, Play, and Rest
- Each action updates stats immediately and visibly
- Actions are contextually limited to prevent stat overflow
- State is saved to localStorage after every action

## User Flow
1. User sees three buttons: Feed, Play, Rest
2. User clicks Feed:
   - Hunger increases by 20 (max 100)
   - Progress bar updates immediately
3. User clicks Play:
   - Happiness increases by 20 (max 100)
   - Energy decreases by 10 (min 0)
   - Both progress bars update immediately
4. User clicks Rest:
   - Energy increases by 30 (max 100)
   - Happiness decreases by 5 (min 0)
   - Both progress bars update immediately
5. After each action, updated stats are saved to localStorage

## Edge Cases
- Feed button is disabled when Hunger is already at 100
- Play button is disabled when Energy is at 0 (too tired to play)
- Rest button is disabled when Energy is already at 100
- Stats cannot exceed 100 or go below 0 from any action
- If pet is in Sick state, actions still work to allow recovery
