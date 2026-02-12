---
name: Battle Animations & Timing
description: Guide for maintaining and adding new battle animations, focusing on specific sequence timing (Entry, Hits, Faints) and the data-driven Animation Framework.
---

# Battle Animations & Timing Guide

## Description
This guide ensures that all battle animations (Entry, Attack hits, Fainting, Switching) maintain the authentic G/S feel by respecting specific sequence timings and CSS class interactions.

## Animation Framework Overview
The project uses a **data-driven, registry-based animation system**:

- **`AnimFramework`** (`js/anim/anim_framework.js`) — The engine. Registers and plays named animation sequences.
- **`anim_registry.js`** (`js/anim/anim_registry.js`) — Pre-built animation definitions (registered on load).
- **`BattleAnims`** (`js/anim/animations.js`) — High-level API the rest of the codebase calls. Delegates to the framework.

### How Move Animations are Triggered
When a move deals damage, the pipeline automatically checks for a registered animation:

```
resolveSingleHit → applyDamage(target, amount, type, moveName)
  → triggerHitAnim(target, type, moveName)
    ① Check: AnimFramework.has(moveName)  → e.g. 'flamethrower'
    ② Check: AnimFramework.has('fx-'+type) → e.g. 'fx-fire'
    ③ Fallback: classic inline (screen flash + sprite shake)
```

Move names are auto-normalized: `'FLAMETHROWER'` → `'flamethrower'`, `'ICE BEAM'` → `'ice-beam'`.

### The `skipAnim` Pattern
If a unique move in `MOVE_DEX` plays its own animation in `onHit` (e.g. Explosion), its internal `moveData` should set `skipAnim: true` to prevent the pipeline from replaying it.

```javascript
// In moves.js — EXPLOSION already calls triggerExplosionAnim()
const moveData = { name: 'EXPLOSION', type: 'normal', power: 250, category: 'physical', skipAnim: true };
```

### Adding a New Move Animation
1. Open `js/anim/anim_registry.js`.
2. Add a new `AnimFramework.register()` call with **8-bit style** (square pixels, hard outlines):
```javascript
AnimFramework.register('flamethrower', [
    { type: 'sfx', sound: 'fire' },
    { type: 'parallel', steps: [
        { type: 'stream', from: 'attacker', to: 'defender',
            count: 18, interval: 30, spread: 14, travelTime: 350,
            size: 5, color: '#ff4500', outline: '#8b0000',
            scaleStart: 0.5, scaleEnd: 2.0
        },
        { type: 'screenFx', class: 'fx-fire', duration: 600 }
    ]},
    { type: 'parallel', steps: [
        { type: 'spriteShake', target: 'defender', duration: 400 },
        { type: 'particles', position: 'defender', count: 8, spread: 20, duration: 400,
            particleStyles: { background: '#ffd700', border: '1px solid #ff4500' }
        }
    ]}
]);
```
3. The animation auto-connects via the `moveName` pipeline — no manual wiring needed.

### Available Step Types
| Type | Parameters | Description |
|------|-----------|-------------|
| `sfx` | `sound`, `wait?` | Play a sound effect |
| `cry` | `cry?`, `target?('attacker'/'defender')`, `wait?` | Play a Pokémon cry |
| `wait` | `ms` | Pause execution |
| `screenFx` | `class`, `duration` | Apply CSS class to scene (auto-removes) |
| `spriteShake` | `target('attacker'/'defender')`, `duration`, `flipped?`, `skipIfInvisible?` | Shake + flicker a sprite |
| `cssClass` | `el`, `class`, `duration`, `persist?` | Toggle a CSS class on any element |
| `move` | `el`, `x`, `y`, `duration`, `easing?`, `reset?` | Translate an element |
| `spawn` | `parent?`, `className`, `styles?`, `tag?`, `text?`, `duration`, `waitAfter?` | Create a temporary DOM element |
| `particles` | `position`, `count`, `spread`, `className?`, `duration`, `particleStyles?` | Burst of impact particles |
| `beam` | `from`, `to`, `className?`, `duration`, `width`, `height`, `beamStyles?` | Projectile from → to |
| `stream` | `from`, `to`, `count`, `interval`, `spread`, `travelTime`, `size`, `color`, `outline?`, `scaleStart?`, `scaleEnd?`, `fade?` | Continuous particle flow (fire, ice, water) |
| `volley` | `from`, `to`, `count`, `interval`, `travelTime`, `projectile: {width, height, styles}` | Rapid-fire pixel projectiles |
| `flash` | `color`, `duration`, `opacity?`, `parent?` | Full-scene color flash |
| `callback` | `fn(ctx)` | Run arbitrary async function |
| `parallel` | `steps: [...]` | Run multiple steps concurrently |

### 8-Bit Particle Style
All particles use square pixels with hard outlines to match the retro aesthetic:
- **Square shapes**: `borderRadius: '0'` (no circles)
- **Hard outlines**: `outline` param → 1px solid border via `boxShadow` (no blur)
- **No glow/blur**: Removed `boxShadow` glows, using `border: '1px solid ...'` on impact particles
- **Pixelated rendering**: `imageRendering: 'pixelated'` set on all particles

### Stream Scaling (Growing Particles)
The `scaleStart` and `scaleEnd` params let particles grow/shrink during travel:
| Move | Scale | Visual Effect |
|------|-------|---------------|
| Ember | 0.4 → 1.5 | Tiny sparks grow to small flames |
| Flamethrower | 0.5 → 2.0 | Small → big flames |
| Fire Blast | 0.6 → 2.5 | Medium → massive flames |
| Hydro Pump | 0.7 → 1.5 | Water droplets swell |
| Solar Beam | 0.6 → 1.6 | Light particles intensify |

### Context Object
When `AnimFramework.play()` is called, a context is resolved with:
- `ctx.attacker` / `ctx.defender` — Pokémon data objects
- `ctx.attackerSprite` / `ctx.defenderSprite` — DOM elements  
- `ctx.attackerPos` / `ctx.defenderPos` — `{ x, y }` center coordinates
- `ctx.scene` / `ctx.fxContainer` — DOM containers
- `ctx.isPlayerAttacker` — boolean

## Core Visual Utilities
- **`UI.resetSprite(el)`**: Always call this before a new major animation to clear leftover transitions/classes.
- **`UI.forceReflow(el)`**: Essential when changing a property (like `opacity: 0`) and immediately starting a transition.
- **`wait(ms)`**: Use for sequential blocking pauses.

## The "Universal Entry" Sequence
For all cases where a Pokémon is sent out (Battle Start, Switch, Replacement):
1. **Dialogue First**: Show the "Go! [Name]!" text first.
2. **Setup**: 
   - `UI.resetSprite(sprite)`
   - `sprite.style.opacity = 0` (Start hidden)
   - `UI.forceReflow(sprite)`
3. **The Reveal**:
   - `AudioEngine.playSfx('ball')`
   - `UI.spawnSmoke(x, y)`
   - `sprite.classList.add('anim-enter')`
   - `sprite.style.opacity = 1` (Ensure it reveals with the grow anim)
4. **The Cry**: Wait `~300ms` (mid-growth) then `AudioEngine.playCry(mon.cry)`.
5. **The HUD**: Wait until growth finishes (`~1000ms` total), then `"swoosh"` in the HUD.

## Attack Hit Sequence
1. **Move Name**: `UI.typeText` the move name.
2. **Visual FX**: `triggerHitAnim(target, moveType, moveName)` — checks framework for move-specific → type-based → inline fallback.
3. **The Hit**:
   - SFX + sprite shake/flicker
   - Impact particles on defender
4. **HP Bar**: Trigger the HP decrease animation *after* the hit completes.

## Fainting Sequence
1. **Text**: "[Name] fainted!"
2. **Audio**: Play faint SFX and faint cry (if implemented).
3. **The Slide**: `sprite.classList.add('anim-faint')`.
4. **Cleanup**: Hide HUD and remove the sprite after the animation completes (`~600ms`).

## CSS Animation Files
- **`css/animations.css`** — All `@keyframes` and `.anim-*`/`.fx-*` trigger classes.
- New `@keyframes` should always be added to `css/animations.css`.

## Best Practices
- **Never skip `UI.forceReflow`** when toggling visibility/classes in the same execution block.
- **Keep timings consistent**: Use the `ANIM` constants in `js/data/constants.js`.
- **CSS Transitions**: Most sprite transitions should be `0.2s` for opacity and `0.4s` for transform/filter.
- **Prefer the framework**: For new animations, use `AnimFramework.register()` instead of writing inline DOM logic.
- **Use `'parallel'` steps** to combine effects that should happen simultaneously.
- **8-bit style**: All new particles must use square shapes and hard outlines — never circles or soft glows.
- **Use `skipAnim`**: If a unique move plays its own animation in `onHit`, set `skipAnim: true` on its internal `moveData`.
