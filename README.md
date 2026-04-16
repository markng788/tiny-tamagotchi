# Tiny Tamagotchi

A virtual pet web app built as a submission for the DeepLearning.AI 7-Day Challenge on Spec-Driven Development.

## What I Built
A single-page virtual pet app where you can name, care for, and evolve your pet. The pet has three stats (Hunger, Happiness, Energy) that decrease over time, and the user must feed, play with, and rest the pet to keep it healthy.

## What I Learned
This project was built using Spec-Driven Development (SDD) — a workflow where you write a detailed Technical Specification before writing any code. The coding agent (Claude Code) then implements the app based on the spec.

Key takeaways:
- Writing specs forces you to make all design decisions upfront
- A good spec eliminates ambiguity and reduces bugs
- The spec becomes permanent documentation for the project

## Tech Stack
- Vanilla HTML, CSS, and JavaScript
- No frameworks, no dependencies
- localStorage for state persistence

## Features
- Pet naming screen on first visit
- Three stats: Hunger, Happiness, Energy (auto-decay every 30 seconds)
- Three actions: Feed, Play, Rest
- Three pet states: Normal, Sick, Evolved
- Offline time calculation — stats decay even when the app is closed
- Full test suite for all three features

## Project Structure
- index.html — main app
- app.js — all game logic
- style.css — all styles
- docs/specs/ — project constitution (mission, roadmap, tech stack)
- docs/living-vitals/ — stat decay feature spec
- docs/care-loop/ — user actions feature spec
- docs/dynamic-states/ — pet states feature spec
- test/ — automated test suites

## How to Run
1. Clone this repository
2. Open index.html in any browser
3. No installation or build steps required

## Submission
Built for the DeepLearning.AI 7-Day Learner Challenge (April 15–22, 2026)
Course: Spec-Driven Development with Coding Agents
