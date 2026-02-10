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
│   └── styles.css        # Global Stylesheet (Single file for now)
└── js/
    ├── core/             # Core Game Logic (The Brain)
    │   ├── game.js       # Game State & Flow (Save/Load, Win/Loss)
    │   ├── battle.js     # Battle Loop & Turn Execution
    │   └── mechanics.js  # Math & Formulas (Damage, Exp, Catch Rate)
    ├── data/             # Static Data (The Database)
    │   ├── constants.js  # Global Config (ANIM, TYPE_CHART)
    │   ├── items.js      # Item Definitions
    │   ├── moves.js      # Move Definitions
    │   └── settings.js   # User Preferences (Keybinds, etc)
    ├── engine/           # Procedural Generators
    │   ├── ai.js         # Enemy AI Logic
    │   └── encounter.js  # Wild Pokemon Generator
    ├── systems/          # Low-Level Utilities (The Plumbing)
    │   ├── api.js        # PokeAPI Interface
    │   ├── audio.js      # Web Audio API Wrapper
    │   ├── input.js      # Keyboard Input Handler
    │   ├── storage.js    # LocalStorage Wrapper
    │   └── utils.js      # Helpers (RNG, Math)
    ├── ui/               # Interface Components
    │   ├── ui.js         # General DOM Helpers (Text typing, HUD updates)
    │   ├── menus.js      # Menu logic (Action, Move, Bag)
    │   └── animations.js # CSS Animation Triggers
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
*   **Rule:** Keep animations in `css/styles.css` but trigger them via `js/ui/animations.js`.

---

## 🛠️ Common Tasks

### Adding a New Move
1.  **Define it**: Add entry to `MOVES` in `js/data/moves.js`.
2.  **Logic**: If it has a unique effect, add a handler in `js/core/mechanics.js` (for effects) or `js/core/battle.js` (for turn flow).
3.  **Anim**: If it needs a specific animation, add to `js/ui/animations.js`.

### Adding a New Item
1.  **Define it**: Add entry to `ITEMS` in `js/data/items.js`.
2.  **Effect**: Add handling logic in `js/core/game.js` (for field use) or `js/core/battle.js` (for battle use).

### Creating a New Screen
1.  **Create File**: `js/screens/newScreen.js`.
2.  **Structure**:
    ```javascript
    const NewScreen = {
        open(data) { ... },
        close() { ... },
        handleInput(key) { ... }
    };
    ```
3.  **Register**: Add script tag to `Pokemon.html`.
4.  **Integrate**: call `NewScreen.open()` from `Game` or `Battle`.
