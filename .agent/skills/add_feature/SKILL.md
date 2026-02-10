---
name: Add Feature
description: Guide for adding new moves, items, or mechanics to the modular Pokemon Battle system.
---

# Adding a New Feature (Move, Item, or Mechanic)

## Description
A systematic guide to adding new content to the Pokemon Battle Modular system, ensuring all relevant files are updated and the modular structure is respected.

## Prerequisites
- **Understand the file structure**: 
  - `js/data`: Definitions (Moves, Items)
  - `js/core`: Logic (Battle flow, Mechanics)
  - `js/ui`: Visuals (Animations, Menus)

## Steps

### 1. Identify the Type of Feature
- **Move**: You will need to edit `js/data/moves.js` and potentially `js/core/moves_engine.js` (for effects) or `js/core/turn_manager.js` (for flow).
- **Item**: You will need to edit `js/data/items.js` and potentially `js/core/game.js` (for usage) or `js/core/capture.js` (for pokeballs).
- **Pokemon**: Usually handled by API, but if hardcoded, check `js/engine/encounter.js`.
- **UI Screen**: Create a new file in `js/screens/`.

### 2. Update Data Definitions
- **Moves**: Add a new entry to the `MOVES` object in `js/data/moves.js`.
  ```javascript
  const MOVES = {
      // ... existing moves
      "new-move-key": {
          name: "New Move Name",
          type: "fire", // or other type
          category: "special", // physical, special, status
          power: 90,
          accuracy: 100,
          pp: 15,
          priority: 0,
          // Optional:
          effect: "May burn the target.",
          chance: 0.1, // effect chance
          target: "selected" // selected, user, all
      }
  };
  ```
- **Items**: Add a new entry to the `ITEMS` object in `js/data/items.js`.

### 3. Implement Logic (If Needed)
- **Moves with Special Effects**:
  - Check `js/core/mechanics.js` for damage calculation tweaks (Type modifiers, extra multipliers).
  - Check `js/core/moves_engine.js` for the primary logic in `executeMove` or `handleMoveSideEffects`.
  - Check `js/core/turn_manager.js` if the move changes the action queue (Multi-turn moves, forcing swaps, priority manipulation).
- **Items**:
  - Check `useItem` in `js/core/game.js` for field usage and general battle consumption.
  - Check `js/core/capture.js` for PokéBall-specific catch logic.

### 4. Register in HTML (If New File Created)
- If you created a new file (e.g., `js/screens/fishing.js`), you **MUST** add `<script src="js/screens/fishing.js"></script>` to `Pokemon.html`.
- **Order matters**: Add it after dependencies (like `ui.js`) but before consumers (like `game.js`).

### 5. Verify
- Run the game (`python3 -m http.server`).
- specialized test: Invoke the move/item using `DEBUG` mode if available, or just give it to a starter Pokemon temporarily in `js/core/game.js` (e.g., `startNewBattle`).
- Ensure no console errors.
