<p align="center">
  <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/250.png" width="120" alt="Ho-Oh">
  <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/249.png" width="120" alt="Lugia">
</p>

<h1 align="center">⚔️ Pokémon G/S Battle Simulator (Modular)</h1>

<p align="center">
  <strong>A modularized and enhanced version of the Pokémon Gold/Silver battle system.</strong>
</p>

> **📦 This is a work-in-progress modularization** of the [original single-file implementation](https://github.com/gabathanasiou/pokemon-gs-battle-system-clone).  
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
- **Original (Single-File):** [pokemon-gs-battle-system-clone](https://github.com/gabathanasiou/pokemon-gs-battle-system-clone) — The complete battle system in one HTML file

---

## 🎮 What Is This?

A fully-featured Pokémon battle simulator inspired by **Pokémon Gold & Silver**. It renders inside a pixel-perfect Game Boy Color shell and features:

> **Important Note:** This is intentionally not a perfectly accurate simulator. It blends multiple mechanics from different generations and aims primarily to be fun to play rather than strictly authentic. I've prioritized making sure the game feels nice and enjoyable! Features like IVs and EVs might be added later, but don't expect super authenticity.

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
| Revive / Max Revive | Revive fainted Pokémon at 50% / full HP |
| Poké Ball / Great / Ultra / Master | Catch wild Pokémon (scaling catch rates) |
| Antidote / Paralyz Heal / Burn Heal / Ice Heal / Awakening / Full Heal | Cure specific status conditions |
| **Evolution Stone** | Forces stone-triggered evolution. Shows a choice menu for Pokémon with multiple Gen I/II evolutions (e.g., Eevee). Drops at **Ultra Rare** rate from wild and boss encounters. Only Gen I/II targets (Pokédex #001–251) are shown. |

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
- **Dynamic Power Scaling** — Pokémon encounters get progressively stronger as you win battles. A dynamic BST (Base Stat Total) floor filters out weak base-stage Pokémon (like Pidgey or Caterpie) as you reach higher rounds.
- **High-Tier Progression** — The chance to encounter Legendary and Pseudo-Legendary Pokémon scales from 10% (early game) to 85% (Round 50+).
- **Gen II Movesets (Crystal-Focused)** — Pokémon follow strict level-up paths from Pokémon Crystal/Gold/Silver.
- **Special Learning Moments** — Customizable chance (`MOVE_LEARN_SPECIAL_CHANCE`) on level-up to learn a rare move from TM/Tutor pools with unique dialogue.
- **First-Stage Starters** — Starter selection screen is filtered to only show basic forms (no middle or final evolutions).
- **Performance Optimized** — Full caching system for species and evolution data to minimize API latency.

### 🎰 Loot System (Per-Pocket)
- **Dynamic Pockets** — Items are categorized into "pockets" (Items, Balls, Key/Stones, TM/HM).
- **Independent Rolls** — Each pocket rolls for success independently using `LOOT_SYSTEM.POCKET_RATES`.
- **Drop Caps** — Battles are limited to a maximum number of standard drops (Wild: 1, Bosses: 2) to maintain balance.
- **Weighted Table** — Loot selection within a pocket is weighted by the enemy's strength, level, and the player's win streak.
- **Support for Future Pockets** — Designed for easy expansion with TM/HM pockets and custom drop rates.
- **Mid-Battle Drops** — Chance to drop a random item from a pocket mid-combat when hit.

### 🐣 Catch System
- Accurate Gen II catch formula
- Poké Ball shake animations (1–3 shakes)
- **Party Overflow Overhaul** — 7th Pokémon slot is temporary; choosing to release the active Pokémon now triggers a specific replacement animation with the new catch.
- **Enhanced UX** — Removed redundant buttons in overflow; keyboard navigation and 'X' key canceling now work reliably.
- Caught Pokémon receive partial HP restoration

### 🍀 Lucky Pokémon Encounters
- **Rare Event** — 5% chance (1/20) to encounter a "Lucky" Pokémon.
- **Distinctive** — **Blue** name text and unique "flash" intro animation.
- **High Reward** — Guaranteed item drop on every hit. 50% chance for rare "Roguelike" stat-boosting items.
- **Uncatchable** — Too lucky to be caught! Deflects standard Poké Balls.
- **Master Ball Interaction** — Playfully swats Master Balls back to the player (Refunded).
- **Passive Nature** — Only uses safe moves (Splash, Recover, Barrier).
- **Pity System** — Percentage increases significantly after 5 battles without a Lucky encounter.

### 💾 Save System & Persistence
- **Persistent Inventory**: Unlike traditional Roguelikes, your items, Poké Balls, and currency are **preserved even if you white out**.
- **Battle Recovery**: Restarting after a total loss ensures you are restocked with a survival kit (5 Potions, 5 Poké Balls) to get you back in the fight.
- **Auto-Save**: The game automatically records progress after every battle.
- **Session Resume**: Mid-battle state (including weather, turn counts, and delayed moves) is preserved across refreshes.
- **Visual Previews**: The continue screen shows your current party mini-sprites, win streak, and trainer name.

### 📕 Integrated Pokédex
- **Global Registry**: A custom Pokédex that tracks every species seen and caught across all runs.
- **Completionist Stats**: Real-time tracking of "Seen" vs "Owned" counts.
- **Evolution Maps**: View the full Gen I/II evolution chains for any Pokémon in your party or inventory.
- **Persistent Data**: Your Dex progress is stored globally, serving as a permanent record of your journey.

### 🧪 Rogue Mechanics (Stat Scaling)
- **Rogue Candy**: Special items like *Mighty Candy* and *Guard Candy* provide flat stat increases to your entire party.
- **Dynamic HUD**: A specialized Rogue Boost overlay appears whenever you find or lose an item, showing the exact impact on your Pokémon's current stats.
- **Decay System**: These powerful buffs are temporary; items decay over a set number of turns (Default: 5 battles), forcing you to adapt your strategy.
- **Recalculation**: All stats are recalculated in real-time as buffs expire, with visual indicators (Green/Red) in the battle UI.

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
├── index.html                # Portal / Landing Page (GitHub Pages Entry)
├── Pokemon.html              # Main Game Entry Point
├── animation_editor.html      # Animation Editor Tool
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

### 🎨 Animation Editor (Beta)
> **Note:** The included `animation_editor.html` tool is a work in progress and currently in beta. It's not 100% complete and there are known bugs, but you are very welcome to try it out, make your own animations, and have fun with it! Things will likely need to be improved over time.

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

### v2.2.0 - Smart Heuristic AI & Progressive IQ (Feb 2026)
**Battle Intelligence Overhaul:**
- 🧠 **Modular Heuristic Engine**: Implemented a completely new AI scoring system in `ai.js`. Moves are no longer random; they are graded based on over 10 different logical heuristics (Type Matchups, Status Utility, Buff Efficiency, etc.).
- 🧠 **Progressive IQ Scaling**: Enemy "IQ" (aiLevel) now scales with your run. Regular Pokémon cap at 80 IQ, while **Bosses scale indefinitely** (`60 + (wins * 4)`), becoming ruthlessly calculating in late-game rounds.
- 🧠 **Move Memory**: The AI now "watches" you. It records move names the player uses and utilizes threat assessment to predict and counter your strategies (e.g., avoiding `Dig` if you've shown `Earthquake`).
- 🧠 **Advanced Battle Tactics**:
    - **Kill Securing**: AI accurately calculates damage and prioritizes high-priority moves or high-damage nukes to finish off low-HP players.
    - **Smarter Sustain**: AI uses healing moves only when critically needed and avoids wasting them at high HP.
    - **Environment Mastery**: AI adapts to Weather (Sun/Rain/Hail) and utilizes Hazards (Spikes/Stealth Rock) intelligently.
    - **Predictive Defensive play**: AI understands that Protect/Detect cannot be spammed and handles two-turn charging/recharge moves with mathematical precision.
- 🎲 **Controlled Randomness**: Even the smartest Bosses retain a base "fuzziness" floor, ensuring they remain beatable and human-like rather than perfectly robotic.

### v2.1.0 - Rogue Feedback & Persistence (Feb 2026)
**Better Power Scaling Information:**
- ✨ **Rogue Boost Box**: Integrated a new stat-box (identical to the level-up box) that triggers whenever a **Rogue Item** (Mighty Candy, Guard Candy, etc.) is found or decayed.
    - Shows the real-time impact of passive boosts on your active Pokémon's stats.
    - Uses **Green** indicators for gains and **Red** for losses/decay.
    - Automatically pairs with rogue loot messages for better "roguelike" feedback.
- 🛠️ **Recalculation Flow**: Refined the order of operations in the loot system to ensure stat increases are reflected in the UI the moment an item is awarded.

### v2.0.0 - Level Up Experience & UI Polish (Feb 2026)
**Visual & Interaction Overhaul:**
- ✨ **Level Up Stat Box**: Implemented a premium, nostalgic stat-gain box that appears when a Pokémon levels up. 
    - Shows mini-sprites (icons) for visual identity.
    - Displays stat gains (e.g., `+3`) in a vibrant blue, followed by new totals after advancing.
    - Clean, borderless design that sits perfectly above the text box.
- ✨ **Dialogue Manager Enhancement**: Added `skipWait: true` support to the `DialogManager`. This allows messages like "Grew to Level X!" to resolve immediately after typing, triggering secondary overlays (like the stat box) without redundant player clicks.
- ✨ **Abbreviated Combat Stats**: Refined level-up UI to use standard handheld abbreviations (`ATK`, `DEF`, `SPD`, `SP. ATK`, `SP. DEF`) for a more authentic feel.

### v1.9.0 - Evolution Stone & Gen 2 Enforcement (Feb 2026)
**Item & Evolution Polish:**
- 🪨 **Evolution Stone Fix**: Fixed a bug where using the Evolution Stone on a Pokémon with multiple evolutions (e.g., Eevee) would close the party screen instead of showing the evolution picker. Root cause: `SummaryScreen.close()` was popping the Party screen off the ScreenManager stack when Summary wasn't open.
- 🪨 **Choice Menu**: When a Pokémon has multiple valid evolutions (e.g., Eevee → VAPOREON / JOLTEON / FLAREON), a clean context menu is shown with just the names — no redundant header label.
- 🪨 **Gen 2 Filter**: All evolution paths into Pokédex #252+ (Gen 3+) are now filtered out across the entire game — level-up evolution checks (`Evolution.check`), the evo stone menu, and the Pokédex evolution chain display. If all of a Pokémon's evolutions are Gen 3+ only, the stone shows "It had no effect."
- 🪨 **Droppable Stone**: Changed Evolution Stone pocket from `key` to `items`. It now appears in the regular bag pocket and can be obtained as an Ultra Rare loot drop from wild and boss encounters.

### v1.8.0 - Evolution UI & Modular Dialogue (Feb 2026)
**Visual Polish & Refactoring:**
- ✨ **Evolution UI Overhaul**: Evolution and move learning now occur within the dedicated evolution screen text box, preventing context-switching to the battle background.
- ✨ **Modular Dialogue**: `DialogManager` now supports dynamic targeting (`targetId`, `arrowId`, `parentId`), allowing any screen to leverage the standardized typing engine.
- ✨ **Dynamic Choice Boxes**: The "Yes/No" choice system now intelligently parents itself to the active screen's dialog container.
- 🎵 **Audio Polish**: Optimized Pokemon cry timing during evolution to play immediately as the congratulations message appears.

### v1.7.0 - Party Screen UX & Overflow Overhaul (Feb 2026)
**Better Team Management:**
- 🔄 **Smart Replacement**: Releasing the active Pokémon during overflow now triggers a proper swap animation where the newly caught Pokémon takes the field.
- 🛠️ **Session Self-Healing**: Implemented a repair system that detects bugged saves with 7 Pokémon and forces an overflow resolution on load or menu open.
- ⌨️ **Keyboard & UX Polish**: Restored keyboard navigation for full-party menus, fixed "Close" button visibility, and mapped the 'X' key to cancel catches/menus consistently.
- 🧹 **Minimalist Overflow**: Removed redundant buttons during release sequences, prioritizing direct Pokémon selection for a cleaner Gen II feel.

### v1.6.0 - Dynamic Encounter Scaling & Power Progression (Feb 2026)
**Fixing the "Pidgey Problem":**
- 📈 **Dynamic BST Floor**: Implemented a scaling Base Stat Total floor that increases per win. At Round 50, weak base-forms are completely filtered out in favor of fully evolved threats (BST floor of 480).
- 📈 **High-Tier Scaling**: The probability of keeping a "High-Tier" (Legendary/Pseudo) roll now scales from 10% in the early game to 85% by Round 50.
- 📈 **Win-Based Difficulty**: High rounds now feel significantly more challenging as the game naturally favors evolved Pokémon.
- ⚙️ **Configurable Progression**: Added new scaling constants to `settings.js` for easy tuning of the difficulty curve.
- 🧪 **Special Moves**: Integrated `MOVE_LEARN_SPECIAL_CHANCE` into the game balance settings for move learning control.

### v1.5.0 - Crystal Movesets & Special Learning (Feb 2026)
**Authentic Progression:**
- 💎 **Crystal Prioritization**: Pokémon now strictly follow their Pokémon Crystal movesets during level-up.
- 💎 **Cross-Gen Fallback**: Pokémon from Gen 3+ automatically lock to their debut generation's moveset to prevent move duplication.
- 💎 **Special Learning Moments**: 15% chance after any level gain to learn a rare move from the Pokémon's TM/Tutor pools.
- 💬 **Unique Dialogue**: Added special text sequences for rare move learning events.
- ⚙️ **API Overhaul**: Refined `getLearnableMoves` and added `getRandomSpecialMove` for intelligent progression.

### v1.4.0 - Lucky Pokémon & Pity System (Feb 2026)
**New Encounter Type:**
- 🍀 **Lucky Pokémon**: New rare encounter type that provides guaranteed loot drops.
- 🍀 **Smart Behavior**: Lucky Pokémon use non-damaging moves to survive longer and give more rewards.
- 🍀 **Pity System**: Bad luck protection ensures you see them eventually.
- 🍀 **Visuals**: Unique gold styling and intro animations.

### v1.3.1 - Enhanced 80/20 Move Selection (Feb 2026)
**Smarter Movesets:**
- 🐣 **Level-Appropriate Moves**: Implemented a per-slot 80% chance for a move to be "recently learned" (one of the last 6 moves in the learnset) and a 20% chance for it to be any move from the Pokémon's entire history.
- 🐣 **Level Window Consistency**: Level 50 Pokémon are now guaranteed to feel like Level 50 threats while still retaining occasional "classic" moves for flavor.

### v1.3.0 - Smart Generation System (Feb 2026)
**Natural Pokemon Generation:**
- 🐣 **Evolution Integrity**: Wild evolved Pokemon now only spawn at or above their official evolution levels.
- 🐣 **Elite Moves**: Implemented 10% chance for egg/high-level moves in the wild.
- 🐣 **Natural Movesets**: No longer forcing 4 moves; Pokemon show up with their natural move count for their level.

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

## 📜 License & Maintenance Notice

> **Maintenance Notice:** I built this primarily for fun, and I'm not entirely sure how much or how often I'm going to maintain it moving forward.

This project is open source and licensed under a **Non-Commercial** license. I am very happy for people to fork this repository, learn from it, and do whatever they want with the code—**as long as it is strictly for non-commercial purposes**. Please do not monetize this.

☕ **Support the Creator:** If you'd like to support the development of future projects, you can [buy me a coffee on Ko-fi](https://ko-fi.com/gabath).

*Disclaimer: This is a fan project. Pokémon is © Nintendo / Creatures Inc. / GAME FREAK Inc. This project is not affiliated with or endorsed by any of these companies. All Pokémon data is sourced from the open [PokéAPI](https://pokeapi.co/) project.*

---

<p align="center">
  <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-ii/gold/25.png" width="56" alt="Pikachu Gold sprite">
  <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-ii/gold/155.png" width="56" alt="Cyndaquil Gold sprite">
  <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-ii/gold/158.png" width="56" alt="Totodile Gold sprite">
  <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-ii/gold/152.png" width="56" alt="Chikorita Gold sprite">
</p>

<p align="center"><em>Built with ❤️ and nostalgia</em></p>
