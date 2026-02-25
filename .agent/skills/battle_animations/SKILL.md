---
name: Battle Animations & Timing
description: Guide for maintaining and adding new battle animations, focusing on specific sequence timing (Entry, Hits, Faints) and the data-driven Animation Framework.
---

# Battle Animations & Timing Guide

## Description
This guide ensures that all battle animations (Entry, Attack hits, Fainting, Switching) maintain the authentic G/S feel by respecting specific sequence timings and CSS class interactions.

## Animation Framework Overview
The project uses a **data-driven, registry-based animation system** spread across three files in `js/anim/`:

- **`AnimFramework`** (`anim_framework.js`) — The engine. Registers and plays named animation sequences. Contains the SVG shape library, formation patterns, and sprite movement presets.
- **`registry/`** — Directory containing modular animation definitions (registered on load):
    - `core.js`: Basic type effects (`fx-fire`, etc.), recovery, status, and system animations.
    - `elemental.js`: Fire, Water, Electric, Grass, and Ice moves.
    - `physical.js`: Normal, Fighting, Flying, and Poison moves.
    - `nature.js`: Ground and Rock moves.
    - `steel.js`: Steel and Metal-themed moves.
    - `mystic.js`: Psychic, Ghost, Dark, Dragon, and multi-elemental moves.
- **`BattleAnims`** (`animations.js`) — High-level API the rest of the codebase calls. Delegates to the framework.

### How Move Animations are Triggered
When a move deals damage, the pipeline automatically checks for a registered animation:

```
resolveSingleHit → applyDamage(target, amount, type, moveName)
  → triggerHitAnim(target, type, moveName)
    ① Check (Pre-Anim): Are conditions valid? (Substitute, Status, Type Immunity)
        → If invalid, log "But it failed!" and STOP.
    ② Check: AnimFramework.has(moveName)  → e.g. 'flamethrower'
    ③ Check: AnimFramework.has('fx-'+type) → e.g. 'fx-fire'
    ④ Fallback: classic inline (screen flash + sprite shake)
```

Move names are auto-normalized: `'FLAMETHROWER'` → `'flamethrower'`, `'ICE BEAM'` → `'ice-beam'`.

### The `skipAnim` Pattern
If a unique move in `MOVE_DEX` plays its own animation in `onHit` (e.g. Explosion), its internal `moveData` should set `skipAnim: true` to prevent the pipeline from replaying it.

```javascript
const moveData = { name: 'EXPLOSION', type: 'normal', power: 250, category: 'physical', skipAnim: true };
```

---

## Available Step Types (20 total)

### Audio & Control
| Type | Parameters | Description |
|------|-----------|-------------|
| `sfx` | `sound`, `wait?` | Play a sound effect |
| `cry` | `cry?`, `target?('attacker'/'defender')`, `wait?` | Play a Pokémon cry |
| `wait` | `ms` | Pause execution |
| `callback` | `fn(ctx)` | Run arbitrary async function |
| `parallel` | `steps: [...]` | Run multiple steps concurrently |
| `sequence` | `steps: [...]` | Run multiple steps in order. Essential for nesting inside `parallel` |

### Visual Effects (Scene-level)
| Type | Parameters | Description |
|------|-----------|-------------|
| `screenFx` | `class`, `duration` | Apply CSS class to scene (auto-removes). Uses classes like `fx-fire`, `fx-water`, etc. |
| `flash` | `color`, `duration`, `opacity?`, `parent?` | Full-scene color overlay that fades out |
| `tilt` | `angle`, `duration` | Rotate the battle scene and spring back. Great for heavy impacts |
| `bgColor` | `color`, `duration` | Temporarily flash the background to a solid color (e.g. dark for Ghost moves) |
| `invert` | `target('scene'\|'attacker'\|'defender')`, `duration` | Invert colors of the entire scene or a single sprite |
| `wave` | `intensity`, `duration`, `speed` | Wavy screen distortion using skew transforms. Psychic/Confusion vibe |
| `cssClass` | `el`, `class`, `duration`, `persist?` | Toggle any CSS class on any element |

### Sprite Effects
| Type | Parameters | Description |
|------|-----------|-------------|
| `spriteShake` | `target`, `duration`, `flipped?`, `skipIfInvisible?` | Shake + flicker a sprite (the classic "hit" reaction) |
| `spriteSilhouette` | `target`, `color`, `hold?`, `duration`, `follow?` | Solid-color silhouette. Follows sprite moves by default. |
| `spriteGhost` | `target`, `color`, `hold?`, `duration` | Stationary silhouette snapshot (ghosting effect). |
| `spriteWave` | `target`, `intensity`, `duration`, `speed` | Wiggle/distortion on a specific sprite. |
| `spriteMove` | `target`, `preset` OR `x,y,duration,easing` | Move a sprite with preset templates or custom coordinates |
| `spriteMetallic` | `target`, `duration`, `color?` | Applies a grayscale metallic filter to the sprite and animates a shiny gradient wipe across it. Supports 'gold'/'bronze' tints. |
| `move` | `el`, `x`, `y`, `duration`, `easing?`, `reset?` | Translate any arbitrary DOM element |

### Projectiles & Particles
| Type | Parameters | Description |
|------|-----------|-------------|
| `stream` | `from`, `to`, `count`, `interval`, `spread`, `travelTime`, `size`, `color`, `outline?`, `scaleStart?`, `scaleEnd?`, `fade?`, `svgShape?` | Continuous particle flow. Core system for fire, ice, water moves. Supports SVG shapes as particles |
| `beam` | `from`, `to`, `className?`, `duration`, `width`, `height`, `beamStyles?` | Single projectile from → to |
| `volley` | `from`, `to`, `count`, `interval`, `travelTime`, `projectile: {width, height, styles}` | Rapid-fire pixel projectiles (e.g. Pin Missile) |
| `particles` | `position`, `count`, `spread`, `className?`, `duration`, `particleStyles?` | Burst of impact particles at a position |

### Shapes & Overlays
| Type | Parameters | Description |
|------|-----------|-------------|
| `overlay` | `target`, `shape`, `color`, `outline?`, `width`, `height`, `duration`, `animation`, `count?`, `spread?` | Render an SVG shape on top of a target with entrance animation |
| `formation` | `target`, `pattern`\|`points`, `particleSize`, `color`, `outline?`, `shape?`, `duration`, `stagger?` | Spawn particles arranged in a predefined pattern (e.g. Fire Blast 大 kanji) |
| `orbit` | `target`, `shape`, `radiusX`, `radiusY`, `count`, `speed`, `duration`, `color`, `outline?`, `yOffset?` | Rotate shapes in an elliptical path around a target. Simulates depth with z-index and scaling. |
| `spawn` | `parent?`, `className`, `styles?`, `tag?`, `text?`, `duration`, `waitAfter?` | Create a temporary DOM element |

---

## Developer Experience: Autocomplete & Types

The project includes a robust JSDoc-based type system in `js/types.js` and a `jsconfig.json` file. This provides **full IntelliSense** for animation sequences in VS Code.

### How to use:
When calling `AnimFramework.register(name, steps)`, the `steps` array is automatically typed.
- As you type `{ type: '...' }`, VS Code will suggest all 20+ available step types.
- Once a type is chosen, VS Code will suggest the specific parameters (e.g. `sound` for `sfx`, `preset` for `spriteMove`).

### Key Types:
- **`AnimStep`**: Defines the required/optional fields for every animation step.
- **`AnimationEngine`**: Typed interface for `AnimFramework`.
- **`BattleEngine`**: Typed interface for the main `Battle` orchestrator.

---

## SVG Shape Library

13 built-in 8-bit pixel-art shapes available for `overlay`, `formation`, and `stream` steps:

| Shape | Use Case |
|-------|----------|
| `lightning` | Thunderbolt striking down |
| `fire` | Flame particles, fire overlays |
| `water` | Water drop effects |
| `leaf` | Grass/nature moves |
| `star` | Impact sparks, sparkle effects |
| `claw` | Slash / claw attack overlays |
| `fist` | Fighting-type punch impacts |
| `skull` | Ghost-type effects |
| `spiral` | Psychic / confusion effects |
| `bird` | Flying-type movements / Confusion |
| `duck` | Confusion effect |
| `rock` | Ground/Rock type impacts |
| `sparkle` | Healing / Status restore effects |
| `music` | Sing / Sonic moves |
| `heart` | Attract / Charm effects |
| `eye` | Glare / Mean Look effects |
| `bubble` | Water / Sleep effects |
| `zzz` | Sleep status |
| `drop` | Sweat drop / Splash |
| `shield` | Protect / Defense effects |
| `wall` | Reflect / Light Screen |
| `anger` | Anger point / frustration vein pop |
| `jaw-top` | Upper set of fangs |
| `jaw-bottom` | Lower set of fangs |
| `bite` | (Deprecated) Combined biting teeth |
| `kick` | High Jump Kick / kicking attacks |
| `poison` | Toxic sludge drop, poison attacks |
| `snow` | Hail / Blizzard snowflakes |
| `gust` | Whirlwind / hurricane tornadoes |
| `spike` | Spikes / caltrop hazards |

---

## Formation Patterns

Predefined point layouts for the `formation` step. Each is an array of `{x, y}` offsets from the target's center.

| Pattern | Shape | Best For |
|---------|-------|----------|
| `fireBlast` | 大 kanji | Fire Blast's iconic symbol |
| `cross` | + shape | Cross-shaped impacts |
| `ring` | ○ circle | Encircling effects |
| `xShape` | ✕ shape | X-shaped hits |

**Custom formations** — pass your own `points` array:
```javascript
{ type: 'formation', target: 'defender',
    points: [{x:0,y:-10}, {x:-10,y:0}, {x:10,y:0}, {x:0,y:10}],
    particleSize: 6, color: '#ff0000', duration: 500
}
```

---

## Sprite Movement Presets

The `spriteMove` step provides quick-access movement templates. Direction is automatically adjusted for player vs. enemy side.

| Preset | Motion | Duration | Best For |
|--------|--------|----------|----------|
| `lunge` | Forward toward opponent, back | 240ms | Physical attacks (Tackle, Slash) |
| `dodge` | Quick sidestep away | 160ms | Evasion, Agility |
| `jump` | Hop up and down | 240ms | Bounce, aerial moves |
| `recoil` | Push backward | 300ms | Take-down, recoil damage |
| `charge` | Rush forward aggressively | 400ms | Hyper Beam charge, Skull Bash |
| `slam` | Up then slam down | 310ms | Body Slam, Earthquake |
| `float` | Gentle rise and fall | 600ms | Levitate, Fly |
| `shake` | Rapid vibration in place | 250ms | Charging up, rage trembling |

**Usage:**
```javascript
{ type: 'spriteMove', target: 'attacker', preset: 'lunge' }
```

---

## HUD Animations (HP & XP Bars)

HUD animations (HP drain and XP gain) are handled in `js/ui/ui.js` but are **data-driven** via weights and durations in `js/data/settings.js`. Tuning these values allows for fine-grained control over the "feel" and "prestige" of battle progress.

### `ANIM_HUD` Configuration
Located in `js/data/settings.js`, this object centralizes all behavior for bars:

| Parameter | Default | Effect |
|-----------|---------|---------|
| `HP_BASE_DURATION` | `1200` | ms for a 100% HP bar change. |
| `HP_ZONE_RED_MULT` | `1.8` | Slowdown multiplier when health is below 20%. |
| `HP_SMALL_HIT_MULT`| `4.0` | Extra slowdown for hits dealing < 15% damage. |
| `HP_TAIL_UNITS` | `3` | The number of final HP digits that "crawl" slowly. |
| `HP_TAIL_MS_PER_UNIT` | `800` | ms per digit during the tail crawl. |
| `HP_EASE_POWER` | `4` | Power for the ease-out curve (Higher = sharper slowdown). |
| `XP_BASE_DURATION` | `2500` | ms for a full 100% XP fill (higher = more prestige). |
| `XP_TICK_RATE` | `60` | ms between sound ticks during growth. |

---

## Dynamic Animations (Function-Based)

You can register a **function** instead of an array. The function receives the resolved context (`attacker`, `defender`, etc.) and must return an array of steps. This allows for logic-based animations (e.g. fewer particles for weak moves).

```javascript
```javascript
const createDrainAnim = (intensity) => {
    return [
        { type: 'sfx', sound: 'grass' },
        // ... logic to adjust particle count based on intensity
    ];
};

AnimFramework.register('absorb', createDrainAnim('low'));
AnimFramework.register('giga-drain', createDrainAnim('high'));
```

---

## Custom Callbacks (Advanced)

For animations that require direct DOM manipulation (e.g., hiding a sprite for "Fly" or "Dig"), use the `callback` step type.

```javascript
{ type: 'callback', fn: ctx => {
    // Direct access to DOM elements
    ctx.attackerSprite.style.opacity = '0';
    ctx.scene.style.filter = 'grayscale(100%)';
}}
```

---

## Adding a New Move Animation

1. Open the relevant file in `js/anim/registry/` (e.g., `elemental.js` for Fire moves).
2. Add a new `AnimFramework.register()` call with **8-bit style**:

```javascript
AnimFramework.register('fire-blast', [
    { type: 'sfx', sound: 'fire' },
    { type: 'spriteMove', target: 'attacker', preset: 'lunge' },
    { type: 'stream', from: 'attacker', to: 'defender',
        count: 15, interval: 25, spread: 12, travelTime: 350,
        size: 6, color: '#ff4500', outline: '#8b0000',
        scaleStart: 0.6, scaleEnd: 2.0, svgShape: 'fire'
    },
    { type: 'sfx', sound: 'fire' },
    { type: 'parallel', steps: [
        { type: 'flash', color: '#ff4500', duration: 300, opacity: 0.3 },
        { type: 'screenFx', class: 'fx-fire', duration: 700 },
        { type: 'spriteShake', target: 'defender', duration: 500 },
        { type: 'formation', target: 'defender', pattern: 'fireBlast',
            shape: 'fire', particleSize: 8,
            color: '#ff4500', outline: '#8b0000',
            duration: 500, stagger: 25
        }
    ]}
]);
```

---

### **Overlay Shapes (Direct hit FX)**
Displays a shape directly on the target's position. Useful for physical strikes, shields, flashes, or elemental bursts.

```javascript
{
    type: 'overlay',
    target: 'defender', // 'attacker', 'defender', 'scene'
    shape: 'claw',      // SVG name
    color: '#ffffff',
    outline: '#000000',
    width: 60, height: 60,
    duration: 300,
    animation: 'strike', // 'strike', 'slam', 'grow', 'fade', 'crunch'
    count: 3,           // number of instances (e.g. 3 scratches)
    spread: 20,         // pixel variance 
    stagger: 100        // ms delay between each shape spawning
}
```

#### **Animation Types:**
- **`strike`**: Slides down into position (good for slashes).
- **`slam`**: Drops from above and scales up (impact moves).
- **`grow`**: Scales from 0 to 1 (shields, bursts).
- **`fade`**: Opacity 0 to 1 (ghostly effects).
- **`crunch`**: Special mode that alternates `jaw-top` and `jaw-bottom` shapes to meet in the middle (bite moves). Best used with `count: 2` and `stagger: 0`.
- **`slash`**: Fast diagonal movement (top-left to bottom-right). Perfect for claw and sword-like attacks.

---

## Best Practices
- **Prefer the framework**: For new animations, use `AnimFramework.register()` instead of writing inline DOM logic.
- **Use SVG shapes** for recognizable forms (lightning, flames).
- **Use sprite movement presets** to add weight and physicality.
- **Layer effects with `parallel`**: Combine screen-level effects with sprite-level effects.
