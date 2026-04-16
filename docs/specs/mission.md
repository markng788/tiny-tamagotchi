# Mission

Build a single-page virtual pet web app where one user can name, care for, and evolve one pet.

## Audience

A single user, no login required.

## Constraints

- No authentication
- Only one pet at a time
- No multiple evolutions, no inventories, no currencies
- No permanent death
- No mini-games or social features

## Core Stats (0–100)

| Stat      | Decay Rate           | Effect at 0       |
|-----------|----------------------|-------------------|
| Hunger    | −5 every 30 seconds  | Pet becomes Sick  |
| Happiness | −3 every 30 seconds  | Pet becomes Sick  |
| Energy    | −4 every 30 seconds  | Pet becomes Sick  |

## User Actions

| Action | Effect                                        |
|--------|-----------------------------------------------|
| Feed   | Hunger +20                                    |
| Play   | Happiness +20, Energy −10                     |
| Rest   | Energy +30, Happiness −5                      |

## Pet States

| State   | Condition                                                                 |
|---------|---------------------------------------------------------------------------|
| Normal  | All stats above 20                                                        |
| Sick    | Any stat reaches 0. Recovery: Feed, Play, and Rest until all stats > 30  |
| Evolved | All stats stay above 70 for 5 consecutive minutes                        |

## Success Criteria

- Pet stats tick down in real time
- User actions correctly update stats
- Pet transitions between Normal, Sick, and Evolved states correctly
- Pet name persists after page refresh (localStorage)
