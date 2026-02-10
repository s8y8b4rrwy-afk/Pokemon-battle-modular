# Project Instructions

This project uses a modular architecture for a Pokémon Battle system. To maintain consistency and avoid breaking complex battle sequences, all agents MUST follow these instructions:

## 🎯 Skill Usage
Every agent working on this repository MUST check the `.agent/skills` directory before starting any task. These skills contain critical timing and architectural rules that are not immediately obvious from the code alone.

- **Add Feature**: Use this when adding new moves, items, or Pokémon to ensure they are placed in the correct sub-modules.
- **Battle Animations & Timing**: Use this when touching visual logic to preserve the authentic G/S battle flow.
- **Project Architecture & Maintenance**: Use this when adding new files or restructuring existing logic to maintain the global module pattern.

## 📐 Architecture
- **TurnManager (`js/core/turn_manager.js`)**: Orchestrates turn flow and the action queue.
- **MovesEngine (`js/core/moves_engine.js`)**: Handles move execution and damage.
- **Battle (`js/core/battle.js`)**: Acting as a high-level manager/orchestrator.

## 🛠️ Testing
Always test battle transitions (entry, fainting, switching) after making changes to the turn logic.
