# 🗺️ Pokemon G/S Battle Simulator — File Structure Map

> **Architecture:** Modular (HTML + External CSS + External JavaScript)  
> **Total Lines:** 6,075 (across 9 files)  
> **Status:** Phase 1 Complete — CSS and self-contained JS modules extracted

---

## 📐 Project Structure

```
pokemon-battle-modular/
├── Pokemon.html          (2,887 lines) — HTML shell + Game/Battle modules
├── css/
│   └── styles.css        (1,980 lines) — All styles + animations
└── js/
    ├── config.js         (640 lines)   — Constants, data tables, MOVE_DEX
    ├── utils.js          (32 lines)    — StatCalc, RNG utilities
    ├── audio.js          (126 lines)   — AudioEngine (Web Audio API)
    ├── api.js            (108 lines)   — API module (PokéAPI fetching)
    ├── storage.js        (32 lines)    — StorageSystem (localStorage)
    ├── input.js          (190 lines)   — Input handler (keyboard navigation)
    └── encounter.js      (80 lines)    — EncounterManager (enemy generation)
```

---

## 🎨 CSS: `css/styles.css` (1,980 lines)

### Design System / CSS Variables (Lines 1–12)
```css
:root {
  --bg-color, --screen-bg, --ui-border
  --hp-green, --hp-yellow, --hp-red
  --text-color, --exp-bar
}
```

### Core Layout (Lines 13–90)
- `body` — centered flex layout
- `.game-boy` — Game Boy shell container (320×288 viewport)
- `.screen` — inner screen area with pixel font
- `@import` — Press Start 2P (retro pixel font from Google Fonts)

### UI Component Styles (Lines 90–790)

| Component | Purpose |
|-----------|---------|
| `.scene` | Battle scene container |
| `.sprite` | Pokémon sprite positioning & rendering |
| `.hud` / `.hud-active` | Player/Enemy HUD panels (HP bars, names, levels) |
| `#dialog-box` | Bottom text/dialog area |
| `#action-menu` | FIGHT / PKMN / PACK / RUN menu grid |
| `#move-menu` / `.move-btn` | Move selection grid + info panel |
| `.move-info-grp` | Move type/power display |
| `.confirm-btn` | Generic confirmation buttons (variants: secondary, nav, danger) |

### Screen-Specific Styles (Lines 660–890)

| Screen | Purpose |
|--------|---------|
| Party Screen | `.party-slot`, `.slot-icon`, `.mini-hp-*` |
| Pack/Bag Screen | `.pack-screen`, `.bag-icon`, `.pack-item` |
| Summary Panel | `.summary-panel`, stat grids, type tags |

### Title & Start Screens (Lines 890–1,213)

| Screen | Purpose |
|--------|---------|
| Start Screen | Title art, `START` button, LCD checkbox |
| Continue Screen | Save preview, `CONTINUE` / `NEW GAME` |
| Name Input Screen | Player name entry |
| Selection Screen | Starter Pokémon picker (3 Pokéballs on table) |

### Visual Effects & Animations (Lines 1,213–1,602)

| Animation | Purpose |
|-----------|---------|
| `.menu-item` styles | Menu item formatting |
| `spriteFlashPurple/Red/Blue` | Status effect sprite flashes |
| `.smoke-particle` | Pokéball throw smoke VFX |
| `.shiny-star` / `@sparkle` | Shiny encounter sparkle effect |
| `.pokeball-anim` | Capture throw + shake + caught animations |
| `@captureThrow` | Ball arc trajectory |
| `@captureShake` | Ball wobble on ground |
| `@flashWhite` | Game Over white flash |
| `.boss-intro` / `.boss-name` | Boss encounter visual flair |
| `anim-enter` / `anim-faint` | Sprite enter (scale up) and faint (fall down) |
| `shake` / `flicker` | Hit reaction animations |
| Stat up/down arrows | `anim-stat-up`, `anim-stat-down` CSS arrows |

### Type-Specific Screen Flashes (Lines 1,690–1,930)
- `.fx-fire` — Red/orange flash
- `.fx-water` — Blue flash
- `.fx-ice` — White/cyan flash
- `.fx-grass` — Green flash
- `.fx-electric` — Yellow flash
- `.fx-psychic` — Purple flash

### Status Animation Classes (Lines ~1,840–1,930)
- `.status-anim-brn` — Red silhouette flash (burn)
- `.status-anim-psn` — Purple silhouette flash (poison)
- `.status-anim-frz` — Cyan brightness flash (freeze)
- `.status-anim-par` — Yellow flash (paralysis)
- `.status-anim-slp` — Dim/darken (sleep)
- `anim-violent` — Screen shake (rage)
- `anim-deflect` — Boss ball deflection

### Flipped Doll Animation (Lines 1,972–1,980)
- `@keyframes shakeFlipped` — Substitute doll hit animation (player-side)
- `.anim-hit-flipped` — Applied to player's substitute sprite

---

## ⚙️ JavaScript Modules

### `js/config.js` (640 lines) — Constants & Data Tables

**Contents:**
- `DEBUG` — Development overrides (inventory, enemy/player attributes, loot rates)
- `wait()` — Promise-based delay helper
- `ANIM` — Animation timing constants (HUD delays, intro, battle events, switching, catching)
- `RARITY` — Loot rarity definitions (base chance, scaling)
- `LOOT_SYSTEM` — Drop rates and item rarity table
- `GAME_BALANCE` — Difficulty settings (crit chance, damage variance, catch rates, rage mechanics)
- `ENCOUNTER_CONFIG` — Boss/shiny spawn rates, level scaling
- `SFX_LIB` — Audio palette (frequencies for sound effects)
- `TYPE_CHART` — Type effectiveness matrix (Gen II mechanics)
- `MOVE_DEX` — Unique move behaviors (METRONOME, SUBSTITUTE, BATON PASS, REST, healing moves, delayed attacks, OHKO moves, TRANSFORM, HAZE, etc.)
- `_heal()`, `_weatherHeal()` — Helper functions for MOVE_DEX
- `sleep()` — Alias for `wait()`
- `STATUS_DATA` — Status condition metadata (names, colors, messages)
- `STAGE_MULT` — Stat stage multipliers (-6 to +6)
- `MOVE_LOGIC` — Two-turn move logic (charge, recharge, protect)
- `WEATHER_FX` — Weather visual effects and messages
- `ITEMS` — Item definitions (potions, balls, revive)

**Dependencies:** None (pure data/config)

---

### `js/utils.js` (32 lines) — Utility Functions

**Contents:**
- `StatCalc` — Gen 2 stat calculation formulas
  - `other(base, lvl)` — Calculate non-HP stats
  - `hp(base, lvl)` — Calculate HP stat
  - `recalculate(p)` — Update Pokémon stats in-place (for leveling up)
- `RNG` — Random number utilities
  - `roll(chance)` — Boolean roll (0.0–1.0)
  - `int(min, max)` — Random integer (inclusive)
  - `pick(array)` — Random array element

**Dependencies:** None

---

### `js/audio.js` (126 lines) — AudioEngine

**Contents:**
- `AudioEngine` — Web Audio API sound synthesis
  - `init()` — Initialize AudioContext and noise buffer cache
  - `playCry(url)` — Play Pokémon cry from URL
  - `playTone(freq, type, dur, vol, delay)` — Play oscillator tone
  - `playNoise(dur)` — Play white noise
  - `playSfx(key)` — Play predefined sound effect (select, damage, throw, catch, heal, levelup, etc.)

**Dependencies:** `SFX_LIB` (from `config.js`)

---

### `js/api.js` (108 lines) — API Module

**Contents:**
- `API` — PokéAPI interaction
  - `base` — API base URL (`https://pokeapi.co/api/v2`)
  - `getPokemon(id, level, overrides)` — Fetch and build complete Pokémon object
    - Fetches species data, calculates stats, determines shiny status
    - Fetches moves in parallel (optimized)
    - Returns full Pokémon object with stats, moves, sprites, cry, etc.
  - `getMove(idOrName)` — Fetch single move data
    - Returns move object with name, type, power, accuracy, category, priority, meta, stat changes

**Dependencies:** `StatCalc` (from `utils.js`)

---

### `js/storage.js` (32 lines) — StorageSystem

**Contents:**
- `StorageSystem` — localStorage wrapper
  - `KEY` — Save key (`'gs_battler_save'`)
  - `save(data)` — Serialize and save game state
  - `load()` — Load and parse game state
  - `exists()` — Check if save exists
  - `wipe()` — Delete save

**Dependencies:** None

---

### `js/input.js` (190 lines) — Input Handler

**Contents:**
- `Input` — Keyboard navigation system
  - `focus` — Current highlighted UI element index
  - `mode` — Current input context (START, BATTLE, MOVES, PARTY, BAG, SELECTION, etc.)
  - `lcdEnabled` — LCD overlay toggle state
  - `init()` — Attach keydown listener
  - `setMode(m, resetIndex)` — Change input mode and reset focus
  - `visuals` — Object mapping modes to visual update functions
    - Each mode defines how to highlight the focused element
  - `updateVisuals()` — Apply focus styling to current element
  - `handlers` — Object mapping modes to key handler functions
    - Each mode defines arrow key navigation and action key behavior
  - `handleKey(e)` — Main keydown event handler
    - Global back button (X key)
    - Navigation sound effects
    - Delegates to mode-specific handler

**Dependencies:** `AudioEngine` (from `audio.js`), `Battle` (from `Pokemon.html`), `Game` (from `Pokemon.html`)

---

### `js/encounter.js` (80 lines) — EncounterManager

**Contents:**
- `EncounterManager` — Wild Pokémon encounter generation
  - `determineSpecs(party, wins)` — Calculate encounter specifications
    - Determines level based on player party average/max
    - Boss status (streak-based or random)
    - Shiny chance
    - Applies DEBUG overrides if enabled
    - Returns specs object (id, level, isBoss, overrides)
  - `generate(party, wins)` — Generate full enemy Pokémon
    - Calls `determineSpecs()` to get specs
    - Fetches Pokémon via `API.getPokemon()`
    - Applies boss attributes (name prefix, HP boost, rage)
    - Applies DEBUG volatiles/rage post-creation
    - Returns enemy Pokémon object

**Dependencies:** `RNG` (from `utils.js`), `ENCOUNTER_CONFIG` (from `config.js`), `DEBUG` (from `config.js`), `API` (from `api.js`)

---

## 🏗️ HTML: `Pokemon.html` (2,887 lines)

### HTML Head (Lines 1–9)
- `<meta>` tags (charset, viewport)
- `<title>` — "G/S Battle Simulator: Final Polish v2"
- `<link rel="stylesheet" href="css/styles.css">` — External CSS

### HTML Body (Lines 11–194)
Complete DOM structure for all screens:
- `#game-container` / `#game-boy` / `#lcd-overlay`
- Start screen (`#start-screen`)
- Name input screen (`#name-screen`)
- Continue screen (`#continue-screen`)
- Summary panel (`#summary-panel`)
- Party screen (`#party-screen`)
- Pack/Bag screen (`#pack-screen`)
- Selection screen (`#selection-screen`)
- Battle scene (`#battle-scene`)
  - Enemy/Player sprites
  - HUDs (HP bars, level, status)
  - Dialog box
  - Action menu (FIGHT/PKMN/PACK/RUN)
  - Move menu
  - Streak box

### Script Tags (Lines 195–201)
```html
<script src="js/config.js"></script>
<script src="js/utils.js"></script>
<script src="js/audio.js"></script>
<script src="js/api.js"></script>
<script src="js/storage.js"></script>
<script src="js/input.js"></script>
<script src="js/encounter.js"></script>
```

### Inline JavaScript (Lines 204–2,884)

#### `Game` Module (Lines 206–821)
**State Management:**
- `party` — Player's Pokémon team (array)
- `activeSlot` — Current active Pokémon index
- `enemyMon` — Current wild Pokémon
- `inventory` — Item counts (potions, balls, revive)
- `wins` / `bossesDefeated` — Win streak tracking
- `playerName` — Player's chosen name
- `state` — Current game state (START, SELECTION, BATTLE, etc.)

**Key Methods:**
- `toggleLcd()` / `toggleRetroMotion()` — Visual settings
- `checkSave()` — Load or start new game
- `confirmName()` — Validate and save player name
- `showSelection()` — Display starter Pokémon selection
- `selectStarter(index)` — Choose starter and begin game
- `openParty(forSwitch)` — Open party screen (view or switch)
- `openBag()` — Open item bag
- `useItem(key, targetIndex)` — Apply item to Pokémon
- `openSummary(index)` / `closeSummary()` — View Pokémon details
- `navSummary(dir)` — Navigate between party members in summary
- `saveGame()` / `loadGame()` — Persist game state
- `newGame()` — Wipe save and restart
- `continueGame()` — Load existing save

#### `Battle` Module (Lines 825–2,831)
**Core State:**
- `p` — Player's active Pokémon
- `e` — Enemy Pokémon
- `uiLocked` — Prevent input during animations
- `delayedMoves` — Future Sight / Doom Desire queue
- `weather` — Current weather effect
- `batonPassActive` — Flag for Baton Pass stat transfer

**Key Methods:**
- `typeText(text, callback, skipPause)` — Typewriter text effect
- `forceReflow(el)` — Force CSS reflow for animations
- `updateHUD(mon, side)` — Update HP bar, level, status icons
- `startBattle(enemy)` — Initialize battle sequence
  - Enemy intro animation
  - Boss shake effect
  - Player Pokémon send-out
  - HUD slide-in
- `showMoves()` — Display move selection menu
- `executeMove(moveIndex)` — Player move execution
  - PP check
  - Recharge/charge turn logic
  - Protect logic
  - Move hit/miss calculation
  - Damage calculation
  - Status effects
  - Stat changes
  - Enemy AI response
- `enemyTurn()` — AI move selection and execution
- `executeDamagePhase(user, target, moveData, isPlayer)` — Damage calculation and application
  - Type effectiveness
  - STAB (Same Type Attack Bonus)
  - Critical hits
  - Damage variance
  - Rage multi-hit
  - HP updates
  - Screen flash effects
- `applyStatChanges(mon, changes, isPlayer)` — Stat stage modifications
- `applyHeal(mon, amt)` — HP restoration
- `processSwitch(newMon, isFaintSwap)` — Switch Pokémon
  - Return animation
  - Substitute restoration
  - Baton Pass stat transfer
  - Send-out animation
- `processFaint(mon, isPlayer)` — Handle Pokémon fainting
  - Faint animation
  - Party check
  - Force switch or game over
- `attemptRun()` — Flee from battle
- `throwBall(ballKey)` — Capture attempt
  - Ball throw animation
  - Catch rate calculation
  - Rage deflection
  - Shake sequence
  - Success/failure handling
  - Party overflow check
- `endBattle(won)` — Post-battle cleanup
  - EXP distribution
  - Level up handling
  - Loot drops
  - HP restoration
  - Win streak tracking
  - Save game
- `uiToMenu()` — Return to main battle menu
- `performVisualSwap(mon, newSrc, isSubstitute, isPlayer)` — Sprite swap animation (for Substitute)

#### `_forceSwitchOrRun` Function (Lines 2,833–2,880)
Standalone helper for forced switch moves (Roar, Whirlwind):
- Selects random Pokémon from opponent's party
- Displays "dragged out" message
- Triggers switch animation

#### Initialization (Lines 2,882–2,884)
```javascript
Input.init();
Input.setMode('START');
```

---

## 🔗 Module Dependencies

```
Pokemon.html (Game, Battle, _forceSwitchOrRun)
    ↓
Input ──→ AudioEngine, Battle, Game
    ↓
EncounterManager ──→ RNG, ENCOUNTER_CONFIG, DEBUG, API
    ↓
API ──→ StatCalc
    ↓
AudioEngine ──→ SFX_LIB
    ↓
config.js (DEBUG, ANIM, RARITY, LOOT_SYSTEM, GAME_BALANCE, 
           ENCOUNTER_CONFIG, SFX_LIB, TYPE_CHART, MOVE_DEX, 
           STATUS_DATA, STAGE_MULT, MOVE_LOGIC, WEATHER_FX, ITEMS)
    ↓
utils.js (StatCalc, RNG)
    ↓
storage.js (StorageSystem)
```

**Load Order (in HTML):**
1. `config.js` — All constants and data (no dependencies)
2. `utils.js` — Utilities (no dependencies)
3. `audio.js` — Depends on `SFX_LIB`
4. `api.js` — Depends on `StatCalc`
5. `storage.js` — No dependencies
6. `input.js` — Depends on `AudioEngine`, `Battle`, `Game`
7. `encounter.js` — Depends on `RNG`, `ENCOUNTER_CONFIG`, `DEBUG`, `API`
8. Inline `Game` and `Battle` modules

---

## 🎯 Phase 2 Roadmap (Future)

**Goal:** Extract `Game` and `Battle` modules into separate files.

**Challenges:**
- Deep coupling between `Game` and `Battle`
- Circular dependencies (Game calls Battle, Battle calls Game)
- Shared state management
- Event-driven architecture

**Proposed Approach:**
1. Create `js/game.js` and `js/battle.js`
2. Refactor to use event emitters or a shared state manager
3. Define clear interfaces between modules
4. Update `Pokemon.html` to load both modules
5. Verify all functionality remains intact

---

## 📝 Notes for Contributors

### External Dependencies
- **PokéAPI** (`https://pokeapi.co/api/v2`) — Pokémon data, moves, sprites
- **Google Fonts** — Press Start 2P font
- **Web Audio API** — Sound synthesis (no external audio files)
- **localStorage** — Save/load game state

### Development Server
```bash
python3 -m http.server 8080
# Open http://localhost:8080/Pokemon.html
```

### Code Style
- **Indentation:** 4 spaces
- **Naming:** camelCase for variables/functions, UPPER_CASE for constants
- **Async:** All battle actions use `async/await` for sequencing
- **Comments:** Inline comments for complex logic, section headers for major blocks

### Testing Checklist
- [ ] Start screen loads with proper styling
- [ ] Name input accepts valid names
- [ ] Starter selection shows 3 Pokémon with cries
- [ ] Battle intro animation plays correctly
- [ ] Moves execute with proper damage/effects
- [ ] Items work (potions, balls, revive)
- [ ] Party switching works
- [ ] Catching Pokémon works (shake animation, success/failure)
- [ ] Leveling up recalculates stats
- [ ] Save/load preserves game state
- [ ] Boss encounters trigger special effects
- [ ] Shiny Pokémon display sparkle animation
- [ ] All status effects apply correctly (burn, poison, sleep, etc.)
- [ ] Two-turn moves work (Fly, Dig, Solar Beam, etc.)
- [ ] Unique moves work (Substitute, Transform, Baton Pass, etc.)

---

**Last Updated:** 2026-02-10  
**Version:** Phase 1 Complete (Modular Architecture)
