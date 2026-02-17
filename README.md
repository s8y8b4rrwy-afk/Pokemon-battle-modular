<p align="center">
  <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/250.png" width="120" alt="Ho-Oh">
  <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/249.png" width="120" alt="Lugia">
</p>

<h1 align="center">⚔️ Pokémon G/S Battle Simulator (Modular)</h1>

<p align="center">
  <strong>A modularized and enhanced version of the Pokémon Gold/Silver battle system.</strong>
</p>

> **📦 This is a work-in-progress modularization** of the [original single-file implementation](https://github.com/s8y8b4rrwy-afk/pokemon-gs-battle-system-clone).  
> The goal is to break down the 6,090-line monolith into a maintainable, modular codebase while preserving all features and adding enhancements.

<p align="center">
  <img src="https://img.shields.io/badge/Generation-II-gold?style=for-the-badge" alt="Gen II">
  <img src="https://img.shields.io/badge/Pokémon-251-red?style=for-the-badge" alt="251 Pokemon">
  <img src="https://img.shields.io/badge/Status-Phase_4_Complete-green?style=for-the-badge" alt="Status">
  <img src="https://img.shields.io/badge/Architecture-Modular_Globals-blue?style=for-the-badge" alt="Modular Globals">
</p>

---

## 🔄 About This Repository

This repository contains a **modularized version** of the original single-file Pokémon battle simulator. 

### 🎯 Goals
- ✅ **Preserve all features** from the original implementation
- 🔧 **Modular architecture** with separate files for better maintainability
- 📦 **Modern tooling** (ES6 modules, build system)
- 🚀 **Enhanced features** and improvements
- 📚 **Better documentation** and code organization

### 🔗 Related Repositories
- **Original (Single-File):** [pokemon-gs-battle-system-clone](https://github.com/s8y8b4rrwy-afk/pokemon-gs-battle-system-clone) — The complete battle system in one HTML file

---

## 🎮 What Is This?

A fully-featured Pokémon battle simulator inspired by **Pokémon Gold & Silver**. It renders inside a pixel-perfect Game Boy Color shell and features:

- 🏟️ Full turn-based battle engine with Gen II damage formula
- 📡 Live Pokémon data from [PokéAPI](https://pokeapi.co/) (all 251 Gen I & II Pokémon)
- 🎵 Synthesized 8-bit sound effects via Web Audio API
- 💾 localStorage save/load system
- 🎨 Retro pixel art aesthetic with LCD filter option
- 🐣 **Smart Generation** — Pokémon spawn with level-appropriate moves and evolution-stage validation

---

## ✨ Features

### ⚔️ Battle System
- **Gen II Damage Formula** — STAB, type effectiveness (18-type chart), critical hits, stat stages (-6 to +6), random variance
- **Priority System** — Speed ties, move priority, action queue sorting
- **Weather** — Sun, Rain, Sandstorm, Hail with damage modifiers and end-of-turn effects
- **Status Conditions** — Burn, Poison, Paralysis, Freeze, Sleep with accurate mechanics
- **Volatile Statuses** — Confusion, Flinch, Substitute, Invulnerability (Fly/Dig), Recharge, Focus Energy

#### Status System Architecture
The game implements a dual-status system:

**Major Statuses** (stored in `mon.status`, only 1 allowed):
- **Burn (BRN)** — Halves physical attack damage, deals 1/8 max HP per turn
- **Poison (PSN)** — Deals 1/8 max HP per turn
- **Paralysis (PAR)** — 25% chance to be unable to move each turn
- **Freeze (FRZ)** — Cannot move, 20% chance to thaw each turn
- **Sleep (SLP)** — Cannot move for 1-3 turns

**Volatile Statuses** (stored in `mon.volatiles`, multiple allowed):
- **Confusion** — 33% chance to hurt self, lasts 2-5 turns
- **Flinch** — Skip turn (resets immediately)
- **Cursed** — Lose 1/4 max HP per turn (from Ghost-type Curse)
- **Perish Song** — Faint after 3 turns countdown
- **Trapped** — Lose 1/16 max HP per turn, cannot switch out (Bind, Wrap, Fire Spin, Whirlpool, Clamp)
- **Leech Seed** — Lose 1/8 max HP per turn, heals opponent
- **Disable** — Prevents using last-used move for 4-7 turns
- **Substitute** — Decoy absorbs damage
- **Invulnerable** — Untargetable during Fly/Dig/Bounce
- **Destiny Bond** — If user faints, opponent faints too
- **Recharging** — Must rest after Hyper Beam
- **Protected** — Immune to attacks (Protect/Detect)

A Pokémon can have **one major status AND multiple volatile statuses simultaneously**. The system includes automatic normalization of PokeAPI ailment names to ensure compatibility.

### 🧠 Move System (80+ Unique Behaviors)
- **Two-Turn Moves** — Fly, Dig, Solar Beam, Skull Bash (with weather skip)
- **Recharge Moves** — Hyper Beam
- **Protection** — Protect, Detect (fails on consecutive use)
- **OHKO Moves** — Fissure, Sheer Cold, Guillotine, Horn Drill
- **Fixed Damage** — Sonic Boom (20), Dragon Rage (40), Seismic Toss (level-based)
- **Field Effects** — Future Sight, Leech Seed, Perish Song, Destiny Bond
- **Unique Moves** — Transform, Metronome, Baton Pass, Substitute, Rest, Pain Split, Belly Drum, Swagger, Counter, Mirror Coat, Rapid Spin, Heal Bell, Present, Magnitude, Curse, and more

### 🎒 Item System
| Item | Effect |
|------|--------|
| Potion / Super / Hyper / Max | Heal 20 / 50 / 200 / Full HP |
| Revive | Revive fainted Pokémon at 50% HP |
| Poké Ball / Great / Ultra / Master | Catch wild Pokémon (scaling catch rates) |

### 😤 Rage System (Original Mechanic)
- Pokémon build **rage** when taking damage or missing attacks
- Rage level (1–3) grants bonus attacks with diminishing power
- Enraged Pokémon can **deflect Poké Balls** (bosses)
- Rage includes recoil risk as a balancing mechanic

### 👹 Boss Encounters
- Triggered periodically based on win streak
- **1.5× HP** multiplier with "BOSS" prefix
- Start at **max rage** (level 3)
- **Cinematic intro** with screen shake and silhouette reveal
- **Guaranteed Elite Moves** — Bosses always have 2 rare/egg/high-level moves
- Team-wide EXP distribution on defeat

### 🐣 Generation & Selection
- **Level-Appropriate Moves** — Movesets favor recently learned moves over generic level 1 moves.
- **Elite/Egg Moves** — 10% chance for wild Pokémon (100% for bosses) to know moves above their level or egg-only moves.
- **Evolution Validation** — Evolved Pokémon (e.g. Charizard) will not appear in the wild below their natural evolution level (Level 36).
- **First-Stage Starters** — Starter selection screen is filtered to only show basic forms (no middle or final evolutions).
- **Performance Optimized** — Full caching system for species and evolution data to minimize API latency.

### 🎰 Loot System
- Items drop from defeated/caught Pokémon
- Weighted loot table that scales with enemy strength and win streak
- Mid-battle drops possible during combat
- Boss encounters have higher drop rates

### 🐣 Catch System
- Accurate Gen II catch formula
- Poké Ball shake animations (1–3 shakes)
- Party management with overflow release mechanic (max 6)
- Caught Pokémon receive partial HP restoration

### 🍀 Lucky Pokémon Encounters
- **Rare Event** — 5% chance (1/20) to encounter a "Lucky" Pokémon.
- **Distinctive** — Gold name text and unique "flash" intro animation.
- **High Reward** — Guaranteed item drop on every hit. 50% chance for rare "Roguelike" stat-boosting items.
- **Uncatchable** — Too lucky to be caught! Deflects standard Poké Balls.
- **Master Ball Interaction** — Playfully swats Master Balls back to the player (Refunded).
- **Passive Nature** — Only uses safe moves (Splash, Recover, Barrier).
- **Pity System** — Percentage increases significantly after 5 battles without a Lucky encounter.

### 💾 Save System & Persistence
- **Game Over Persistence**: If you black out, you keep your items!
- **Safety Net**: Restarting after a black out ensures you have at least 5 Potions and 5 Poké Balls.
- Auto-saves after each battle
- Saves: party, inventory, win streak, active battle state
- Resume mid-battle with weather and delayed moves preserved
- Save preview on continue screen with party icons

---

## 🚀 Getting Started

### Option 1: Direct Open
Simply open `Pokemon.html` in any modern browser:
```bash
# macOS
open Pokemon.html

# Linux
xdg-open Pokemon.html

# Windows
start Pokemon.html
```

### Option 2: Local Server (Recommended)
```bash
# Python 3
python3 -m http.server 8000

# Then navigate to http://localhost:8000/Pokemon.html
```

### Option 3: VS Code Live Server
1. Install the [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) extension
2. Right-click `Pokemon.html` → "Open with Live Server"

> **Note:** Internet connection required for PokéAPI data (sprites, moves, cries).

---

## 🕹️ Controls

### Keyboard
| Key | Action |
|-----|--------|
| `↑ ↓ ← →` | Navigate menus |
| `Z` / `Enter` | Confirm / Select |
| `X` | Back / Cancel |

### Mouse
- Click any button or menu item directly
- Hover to preview Pokémon and move info

---

## 🏗️ Architecture

> **No-Bundler Modular Approach.** Modules are defined as global singleton objects and loaded sequentially via `<script>` tags in `Pokemon.html`.

### Project Structure

```
pokemon-battle-modular/
├── Pokemon.html              # Main Entry Point
├── css/                      # Modular Stylesheets (10 files)
│   ├── base.css              # Root variables, body, game container
│   ├── utils.css             # Utility classes, focus states, scrollbars
│   ├── screens.css           # Start, Name Entry, Continue screens
│   ├── selection.css         # Starter selection lab
│   ├── summary.css           # Pokémon summary panel
│   ├── party.css             # Party screen & context menu
│   ├── pack.css              # Bag/item screen
│   ├── battle.css            # Battle scene, sprites, HUD, dialog
│   ├── animations.css        # All @keyframes & animation classes
│   └── explosion.css         # Explosion FX
└── js/                       # 31 JS Modules
    ├── core/                 # Core Game Logic
    │   ├── game.js           # Game State & Flow
    │   ├── battle.js         # Battle Manager (Orchestrator)
    │   ├── turn_manager.js   # Turn Sequences & Action Queue
    │   ├── moves_engine.js   # Move Logic & Damage Execution
    │   ├── mechanics.js      # Math (Damage, Exp, Catch Rate)
    │   ├── effects.js        # End-of-turn effects & status ticks
    │   ├── capture.js        # Pokéball catch logic
    │   ├── environment.js    # Weather & field effects
    │   ├── faint_manager.js  # Fainting & replacement logic
    │   └── rage_manager.js   # Rage mechanic processing
    ├── data/                 # Static Data & Config
    │   ├── constants.js      # ANIM, TYPE_CHART, STATUS_DATA
    │   ├── debug.js          # Debug/Dev Mode Configuration
    │   ├── items.js          # Item Definitions
    │   ├── moves.js          # Move Definitions (MOVE_DEX)
    │   └── settings.js       # User Preferences
    ├── engine/               # Procedural Generators
    │   ├── ai.js             # Enemy AI Logic
    │   └── encounter.js      # Wild Pokemon Generator
    ├── systems/              # Low-Level Utilities
    │   ├── api.js            # PokeAPI Interface
    │   ├── audio.js          # Web Audio API Wrapper
    │   ├── input.js          # Keyboard Input Handler
    │   ├── logger.js         # Battle Logger
    │   ├── storage.js        # LocalStorage Wrapper
    │   └── utils.js          # Helpers (RNG, Math, wait)
    ├── ui/                   # Interface Components
    │   ├── ui.js             # General DOM Helpers (Text, HUD)
    │   ├── menus.js          # Menu logic (Fight, Bag, PKMN)
    │   ├── anim_framework.js # Data-driven animation engine
    │   ├── anim_registry.js  # Pre-built animation definitions
    │   └── animations.js     # High-level animation API
    └── screens/              # Full-Screen Modules
        ├── party.js          # Pokemon Party Screen
        ├── selection.js      # Starter Selection Screen
        └── summary.js        # Pokemon Summary Screen
```

### Animation Framework
Battle animations use a **registry-based, data-driven system**:
- Define animations as arrays of declarative steps (SFX, beams, particles, screen flashes, sprite shakes)
- Register with `AnimFramework.register('name', steps)` in `anim_registry.js`
- Play with `AnimFramework.play('name', { attacker, defender, isPlayerAttacker })`
- Supports `parallel` steps for combining effects simultaneously

### Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| **Single file** | Zero setup, instant deployment, shareable as one file |
| **No framework** | Pure vanilla JS for minimal overhead and direct DOM control |
| **Object literal modules** | Simple namespace pattern without class boilerplate |
| **Async/await battle engine** | Natural expression of sequential animation chains |
| **PokéAPI dependency** | Access to all 251 Pokémon without bundling sprite assets |
| **Web Audio synthesis** | 8-bit sound effects without audio file dependencies |

---

## 🎯 Debug Mode

Enable debug mode by setting `DEBUG.ENABLED = true` in the JavaScript section:

```javascript
const DEBUG = {
    ENABLED: true,
    PLAYER: {
        ID: 6,           // Force Charizard
        LEVEL: 50,       // Set level
        SHINY: true,     // Force shiny
        MOVES: null,     // Override moves
    },
    ENEMY: {
        ID: 150,         // Force Mewtwo
        LEVEL: 100,      // Set level
        IS_BOSS: true,   // Force boss
    },
    INVENTORY: {
        masterball: 99,
        maxpotion: 99,
    },
    LOOT: {
        FORCE_ITEM: 'ultraball',
    }
};
```

---

## 📊 Technical Details

| Metric | Value |
|--------|-------|
| **Total Lines** | ~7,850 |
| **JS Files** | 31 modules |
| **CSS Files** | 10 stylesheets |
| **CSS Lines** | ~2,000 |
| **JS Lines** | ~5,600 |
| **HTML Lines** | ~250 |
| **Keyframe Animations** | 50+ |
| **Registered Anim Sequences** | 20+ (via AnimFramework) |
| **Unique Move Behaviors** | 80+ |
| **Sound Effects** | 27 synthesized SFX |
| **Pokémon Available** | 251 (Gen I + II) |
| **Type Matchups** | Full 18×18 chart |
| **Save Format** | JSON via localStorage |

---

## 🔗 Credits & Dependencies

| Resource | Usage |
|----------|-------|
| [PokéAPI](https://pokeapi.co/) | Pokémon data, stats, moves, sprites |
| [PokeAPI Sprites](https://github.com/PokeAPI/sprites) | Official artwork, icons, front/back sprites |
| [Google Fonts — Press Start 2P](https://fonts.google.com/specimen/Press+Start+2P) | Retro pixel typeface |
| [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API) | Synthesized sound effects |


---

## 📝 Recent Updates

### v1.4.0 - Lucky Pokémon & Pity System (Feb 2026)
**New Encounter Type:**
- 🍀 **Lucky Pokémon**: New rare encounter type that provides guaranteed loot drops.
- 🍀 **Smart Behavior**: Lucky Pokémon use non-damaging moves to survive longer and give more rewards.
- 🍀 **Pity System**: Bad luck protection ensures you see them eventually.
- 🍀 **Visuals**: Unique gold styling and intro animations.

### v1.3.0 - Smart Generation System (Feb 2026)
**Natural Pokemon Generation:**
- 🐣 **Level-Appropriate Moves**: Movesets weighted to prefer recently learned moves.
- 🐣 **Elite Moves**: Implemented 10% chance for egg/high-level moves in the wild.
- 🐣 **Natural Movesets**: No longer forcing 4 moves; Pokemon show up with their natural move count for their level.
- 🐣 **Evolution Integrity**: Wild evolved Pokemon now only spawn at or above their official evolution levels.

**Refined Selection:**
- 🛡️ **Starter Filtering**: Selection screen now strictly offers first-stage Pokemon only.
- ⚡ **API Optimization**: Introduced persistence cache for PokeAPI data (Species, Evolution, Stats).
- ⚡ **Lazy Validation**: Evolution checks performed before heavy move-fetching to improve encounter speed.

### v1.2.0 - Modularization & Animation Framework (Feb 2026)
**CSS Modularization:**
- ✅ Split 1,993-line `styles.css` into 10 focused files (base, utils, screens, selection, summary, party, pack, battle, animations, explosion)
- ✅ Cleaned up duplicate `@keyframes` definitions

**Animation Framework:**
- 🎬 Data-driven animation engine (`AnimFramework`) with 14 declarative step types
- 🎬 Registry-based system — new animations added by calling `AnimFramework.register()`
- 🎬 Pre-built beam, particle, flash, and screen-shake animations for major move types
- 🎬 Side-agnostic context resolution (attacker/defender auto-resolved)

**New Modules:**
- ➕ `anim_framework.js` — Animation engine
- ➕ `anim_registry.js` — Animation definitions
- ➕ `rage_manager.js` — Extracted rage mechanic
- ➕ `logger.js` — Battle logging system

### v1.2.1 - Enhanced Developer Experience (Feb 2026)
**Type System:**
- 💎 **JSDoc Type Registry** — Created `js/types.js` to provide project-wide autocomplete for `Pokemon`, `Battle`, and `Items`.
- 💎 **Animation IntelliSense** — Full typing for the `AnimFramework`. Writing new animations now provides suggestions for all 20+ step types and their parameters.
- 💎 **VS Code Integration** — Added `jsconfig.json` to enable deep IntelliSense across modular JS files without a bundler.
- 💎 **Permissive Contexts** — Specifically designed types to allow for future extensibility (e.g., custom volatiles) while maintaining core validation.

### v1.1.0 - Status System Overhaul (Feb 2026)
**Fixed:**
- ✅ Status ailment TypeError when applying burn, poison, paralysis from moves
- ✅ Confusion incorrectly being set as major status instead of volatile
- ✅ Redundant "already has a status" messages

**Improved:**
- 🎯 Added automatic normalization of PokeAPI ailment names (`paralysis` → `par`, `burn` → `brn`, etc.)
- 💬 Contextual status messages (different text when applied vs. ongoing)
  - Apply: "PIKACHU was burned!"
  - Tick: "PIKACHU is hurt by its burn!"
- 🛡️ Safety checks to prevent invalid status values from crashing the game
- 📚 Enhanced documentation of dual-status system architecture

**Technical:**
- Added `normalizeAilment()` helper in both `EffectsManager` and `API` modules
- Updated `STATUS_DATA` with separate `applyMsg` and `tickMsg` properties
- Improved error handling in `processEndTurnStatus`

---

## �📄 Documentation


For a detailed structural breakdown of every module, function, constant, and line range in the codebase, see:

📖 **[`agents.md`](./agents.md)** — Complete file structure map

---

## 📜 License

This is a fan project. Pokémon is © Nintendo / Creatures Inc. / GAME FREAK Inc. This project is not affiliated with or endorsed by any of these companies. All Pokémon data is sourced from the open [PokéAPI](https://pokeapi.co/) project.

---

<p align="center">
  <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-ii/gold/25.png" width="56" alt="Pikachu Gold sprite">
  <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-ii/gold/155.png" width="56" alt="Cyndaquil Gold sprite">
  <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-ii/gold/158.png" width="56" alt="Totodile Gold sprite">
  <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-ii/gold/152.png" width="56" alt="Chikorita Gold sprite">
</p>

<p align="center"><em>Built with ❤️ and nostalgia</em></p>
