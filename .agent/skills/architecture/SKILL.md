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
2. **Low-Level Engines**: `audio.js`, `api.js`, `storage.js`.
3. **Core Logic**: `mechanics.js`, `effects.js`, `moves_engine.js`.
4. **UI**: `ui.js`, `menus.js`, `animations.js`.
5. **Managers & Orchestrators**: `turn_manager.js`, `battle.js`, `game.js`.

**Rule**: If `Module A` calls `Module B`, `Module B` MUST be loaded before `Module A` in the HTML file.

## Cross-Module Communication
Since everything is global, you can call `Battle.someMethod()` from `TurnManager.js`.
- **Constraint**: Be careful of circular dependencies. If two modules need each other, they should probably both be children of a larger orchestrator (like `Battle`).

## Adding a New Module
1. Create the file in `js/core/`, `js/ui/`, etc.
2. Define the main object.
3. **MUST**: Add the script tag to `Pokemon.html` in the correct prioritized section.
4. Document the module in `agents.md`.
