# 🗺️ Pokemon Battle Modular - Developer Field Guide

> **Architecture:** Modular (ES5-style globals)
> **Stack:** HTML5, CSS3, Vanilla JS
> **Key Principle:** Simplicity & Modularity. No Bundlers. No heavy frameworks.
> **Philosophy:** "Code for the Future." Keep it clean, keep it readable.

---

## 📂 Project Structure

It is CRITICAL to respect this structure. Do not place files randomly.

```plaintext
pokemon-battle-modular/
├── Pokemon.html          # Main Entry Point (Loads all scripts in order)
├── css/
│   ├── base.css          # Root variables, body, game container, LCD
│   ├── utils.css         # Hidden, buttons, focus states, scrollbars, retro motion
│   ├── screens.css       # Start, Name Entry, Continue screens
│   ├── selection.css     # Starter selection lab screen
│   ├── summary.css       # Pokémon summary panel
│   ├── party.css         # Party screen & context menu
│   ├── pack.css          # Bag/item screen
│   ├── battle.css        # Battle scene, sprites, HUD, dialog, menus
│   ├── animations.css    # All @keyframes & animation classes
│   └── explosion.css     # Explosion FX
└── js/
    ├── core/             # Core Game Logic (The Brain)
    │   ├── game.js       # Game State & Flow (Save/Load, Win/Loss)
    │   ├── battle.js     # Battle Manager (Orchestrator)
    │   ├── turn_manager.js # Turn Sequences & Action Queue
    │   ├── moves_engine.js # Move Logic & Damage Phase Execution
    │   ├── mechanics.js  # Math & Formulas (Damage, Exp, Catch Rate)
    │   ├── effects.js    # End-of-turn effects & status processing
    │   ├── capture.js    # Pokéball catch logic & animations
    │   ├── environment.js # Weather & field effects
    │   ├── faint_manager.js # Fainting, replacement, & simultaneous faint logic
    │   └── rage_manager.js  # Rage mechanic processing
    ├── data/             # Static Data (The Database)
    │   ├── constants.js  # Global Config (ANIM, TYPE_CHART, STATUS_DATA)
    │   ├── debug.js      # Debug/Dev Mode Configuration
    │   ├── items.js      # Item Definitions
    │   ├── moves.js      # Move Definitions (MOVE_DEX)
    │   └── settings.js   # User Preferences (Keybinds, etc)
    ├── engine/           # Procedural Generators
    │   ├── ai.js         # Enemy AI Logic
    │   └── encounter.js  # Wild Pokemon Generator (Validation & Scaling)
    ├── systems/          # Low-Level Utilities (The Plumbing)
    │   ├── api.js        # PokeAPI Interface (Smart Selection & Caching)
    │   ├── audio.js      # Web Audio API Wrapper
    │   ├── input.js      # Keyboard Input Handler
    │   ├── logger.js     # Battle Logger (Console output)
    │   ├── storage.js    # LocalStorage Wrapper
    │   └── utils.js      # Helpers (RNG, Math, wait)
    ├── ui/               # Interface Components
    │   ├── ui.js            # General DOM Helpers (Text typing, HUD updates)
    │   ├── menus.js         # Menu logic (Action, Move, Bag)
    │   ├── anim_framework.js # Data-driven animation engine (registry + step executor)
    │   ├── anim_registry.js  # Pre-built animation definitions (registered sequences)
    │   └── animations.js    # High-level animation API (delegates to framework)
    │   └── screen_manager.js # Central Screen Stack & Transition Manager
    └── screens/          # Full-Screen Modules
        ├── party.js      # Pokemon Party Screen
        ├── selection.js  # Starter Selection Screen
        └── summary.js    # Pokemon Summary Screen
```

---

## 📐 Coding Standards & Rules

### 1. Global Module Pattern
Since there is no bundler, valid JS modules are created using global objects.
*   **Rule:** Every file in `js/core`, `js/systems`, `js/ui`, `js/screens` must expose **exactly one main global object** (e.g., `const Battle = { ... }`).
*   **Rule:** Do not leak variables. Configuration constants go in `js/data/constants.js`. Helper functions go in `js/systems/utils.js` or inside the module object.

### 2. Dependency Management
Order matters in `Pokemon.html`.
1.  **Systems & Data** (Load first - foundational)
2.  **Engine** (Depends on Data/Systems)
3.  **UI** (Depends on Engine)
4.  **Core** (Depends on everything)
*   **Rule:** If `Battle` uses `UI`, `UI` must be loaded before `Battle`.
*   **Rule:** When adding a new file, ALWAYS adds its `<script>` tag to `Pokemon.html` in the correct section.

### 3. Asynchrony
*   **Rule:** Text typing, animations, and API calls are `async`. Use `await` generously to ensure the UI stays in sync with the logic.
*   **Rule:** Use `await wait(ms)` from `utils.js` for pauses. Do not use `setTimeout` unless absolutely necessary for non-blocking UI effects.

### 4. State Management
*   **Rule:** `Game` module holds the persistent state (Party, Inventory, Wins).
*   **Rule:** `Battle` module holds the transient state (Current turn, Weather, Volatile status).
*   **Rule:** `StorageSystem` handles the persistence to `localStorage`.

### 5. CSS & Styling
*   **Rule:** Use kebab-case for classes (`.hp-bar`, `.active-slot`).
*   **Rule:** ID selectors are okay for unique static elements (`#player-hud`).
*   **Rule:** CSS is modular: `base.css` (variables), `battle.css` (scene), `animations.css` (keyframes), etc.
*   **Rule:** New `@keyframes` go in `css/animations.css`. New screen styles go in their own CSS file.

### 6. Animation Framework
*   **Rule:** New battle animations should be registered via `AnimFramework.register(name, steps)` in `js/anim/anim_registry.js`.
*   **Rule:** Steps are declarative objects: `{ type: 'sfx'|'beam'|'particles'|'screenFx'|'spriteShake'|'flash'|'spawn'|'parallel'|..., ...params }`.
*   **Rule:** Use `'attacker'` and `'defender'` as position/element references — the framework resolves player/enemy side automatically.
*   **Rule:** `BattleAnims.playRegistered(name, ctx)` is the preferred entry point for new code.
*   **Rule:** The system separates physical impact (`.anim-shake-only`) from damage reaction (`.anim-flicker-only`).
*   **Rule:** Standard animations use `spriteShake` (shakes only). `Battle.applyDamage` triggers the flicker. Do not combine them manually.

### 7. Screen Management
*   **Rule:** All screen transitions MUST use `ScreenManager`.
    *   `ScreenManager.push(id)`: Open a new screen on top (e.g. Bag, Party).
    *   `ScreenManager.pop()`: Close the top screen and return to the previous one.
    *   `ScreenManager.replace(id)`: Swap the current screen (e.g. Title -> Name Input).
    *   `ScreenManager.clear()`: **CRITICAL** - Use this to wipe the entire screen stack before starting/resuming a battle or returning to the title screen.
*   **Interface:** Every screen module MUST implement:
    *   `id`: Unique string ID (e.g. 'PARTY').
    *   `onEnter(params)`: Setup logic when screen opens.
    *   `onExit()`: Cleanup logic when screen closes.
    *   `onResume()`: Logic when returning to this screen from another (e.g. back from Party to Bag).
    *   `handleInput(key)`: Return `true` if input method handled the key.

---

## 📖 Agent Skills Reference

These skills provide detailed, step-by-step guidance for common workflows. **Always read the relevant skill before starting a task.**

| Skill | Path | When to Use |
|-------|------|-------------|
| **Add Feature** | `.agent/skills/add_feature/SKILL.md` | Adding new moves, items, or mechanics. Covers MOVE_DEX patterns, return values, end-of-turn effects, animation registration, and testing checklist. |
| **Battle Animations & Timing** | `.agent/skills/battle_animations/SKILL.md` | Creating or modifying battle animations. Documents the `AnimFramework` step types, context object, entry/hit/faint sequences, and CSS animation file conventions. |
| **Project Architecture & Maintenance** | `.agent/skills/architecture/SKILL.md` | Understanding the modular structure, script loading order, global module pattern, cross-module communication, and CSS file organization. |
| **Screen Management & Navigation** | `.agent/skills/screens/SKILL.md` | Guide for creating new screens and managing transitions using the ScreenManager framework. |

---

## 🛠️ Common Tasks

### Adding a New Move
1.  **Define it**: Add entry to `MOVES` in `js/data/moves.js`.
2.  **Logic**: If it has a unique effect, add a handler in `js/core/mechanics.js` (for effects) or `js/core/battle.js` (for turn flow).
3.  **Anim**: Register an animation via `AnimFramework.register()` in `js/anim/anim_registry.js`.

### Adding a New Item
1.  **Define it**: Add entry to `ITEMS` in `js/data/items.js`.
2.  **Effect**: Add handling logic in `js/core/game.js` (for field use) or `js/core/battle.js` (for battle use).

### Creating a New Screen
1.  **Create File**: `js/screens/newScreen.js`.
2.  **Structure**:
    ```javascript
    const NewScreen = {
        id: 'NEW_SCREEN',
        onEnter(params) { ... },
        onExit() { ... },
        onResume() { ... },
        handleInput(key) { ... }
    };
    ```
3.  **Register**: Add script tag to `Pokemon.html`.
4.  **Integrate**: call `NewScreen.open()` from `Game` or `Battle`.
