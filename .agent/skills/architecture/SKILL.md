---
name: Project Architecture & Maintenance
description: Guide for maintaining the modular structure, script order, and global module patterns.
---

# Project Architecture & Maintenance

## Description
This project uses a "No-Bundler" modular approach. Modules are defined as global objects and loaded sequentially via script tags in `Pokemon.html`.

## Global Module Pattern
All modules must follow the singleton object pattern:
```javascript
const ModuleName = {
    // State
    stateVar: null,
    
    // Methods
    init() { ... },
    doSomething() { ... }
};
```
- **Rule**: Do not use `export` or `import` (Browser support for modules is not currently used to avoid CORS/Server issues for local files).
- **Rule**: Avoid leaking variables to the global scope. Everything should live inside a module object or `constants.js`.

## Dependency & Script Order
The order in `Pokemon.html` is strictly enforced. When adding a new file, place it in the correct category:

1. **Systems & Data** (Foundation): `utils.js`, `constants.js`, `settings.js`.
2. **Low-Level Engines**: `audio.js`, `api.js`, `storage.js`, `logger.js`.
3. **Data Definitions**: `items.js`, `moves.js`, `debug.js`.
4. **Core Logic**: `mechanics.js`, `effects.js`, `moves_engine.js`, `capture.js`.
5. **UI**: `ui.js`, `menus.js`.
6. **Animation** (`js/anim/`): `anim_framework.js` → `anim_registry.js` → `animations.js`.
   - Framework contains: 20 step types, SVG shape library (9 shapes), formation patterns (4 presets), sprite movement presets (8 presets).
   - Registry defines all move-specific animations using the framework's declarative API.
   - Animations module is the public API that delegates to the framework.
7. **Screens**: `party.js`, `summary.js`, `selection.js`.
8. **Managers & Orchestrators**: `rage_manager.js`, `turn_manager.js`, `battle.js`, `game.js`.

**Rule**: If `Module A` calls `Module B`, `Module B` MUST be loaded before `Module A` in the HTML file.

## Cross-Module Communication
Since everything is global, you can call `Battle.someMethod()` from `TurnManager.js`.
- **Constraint**: Be careful of circular dependencies. If two modules need each other, they should probably both be children of a larger orchestrator (like `Battle`).

## Adding a New Module
1. Create the file in `js/core/`, `js/ui/`, `js/anim/`, `js/systems/`, etc.
2. Define the main object.
3. **MUST**: Add the script tag to `Pokemon.html` in the correct prioritized section.
4. Document the module in the relevant skill doc.

## CSS Structure
CSS is split into modular files loaded in order in `Pokemon.html`:
- `base.css` → Variables, body, game container
- `utils.css` → Utility classes, focus states, scrollbars
- `screens.css` → Start, Name, Continue screens
- `selection.css`, `summary.css`, `party.css`, `pack.css` → Individual screen styles
- `battle.css` → Battle scene, HUD, dialog, menus
- `animations.css` → All `@keyframes` and `.anim-*`/`.fx-*` classes (covers all 18 types)
- `explosion.css` → Explosion-specific FX (`@keyframes screenShake`, `.fx-explosion`) — still needed, the animation framework applies these CSS classes but doesn't generate them

New `@keyframes` always go in `animations.css`. New screen styles get their own file.

---

## Developer Experience & Type System

To maintain the project's complex modular structure without a bundler, we use **JSDoc Typedefs** and **`jsconfig.json`**.

### `jsconfig.json`
Located in the root, this file enables project-wide IntelliSense. It tells VS Code that all scripts in `js/` share a global scope, despite being in separate files.

### `js/types.js`
Central registry of types. Contains:
- **`Pokemon`**: Full data structure for Pokémon objects.
- **`BattleEngine`**: The main orchestrator methods.
- **`AnimationEngine` / `AnimStep`**: Complete typing for the data-driven animation framework.
- **`MoveEntry` / `ItemEntry`**: Structures for move and item databases.

**Rule**: When creating new complex objects or framework steps, update `types.js` to preserve autocomplete across the project.
